import { nextTick, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

const baseRotationX = 0
const baseRotationY = 0
const mobileRouteRotationDamping = 5.6
const fullRotation = Math.PI * 2
const topNavigationThreshold = 24
const routeOrder = ['/', '/experience', '/projects', '/contact']
const scrollDrivenRoutes = new Set(['/'])
const heroScaleFactor = 4
const maxPixelRatio = 1.5
const rotationSettleThreshold = 0.001
const momentumSettleThreshold = 0.01
const scrollStopDelayMs = 70
const scrollMomentumDuration = 0.42
const maxMomentumAngle = Math.PI * 0.4
const bottomScrollTolerance = 2
const overscrollVelocityFactor = 7
const lineScrollPixels = 16
const mobileBreakpoint = 768
const sizeStabilizationFrames = 4

type HeaderLogoRouteSpinDetail = {
  direction: 1 | -1
  fromPath: string
  sequence: number
  startAngle: number
  targetAngle: number
  toPath: string
}

type HeaderLogoRouteSpinWindow = Window & {
  __headerLogoRouteSpin?: HeaderLogoRouteSpinDetail
}

export function useLogoThreeScene(container: Ref<HTMLElement | null>, text?: string) {
  const route = useRoute()

  let reqId: number | null = null
  let handleResize: (() => void) | null = null
  let handleScroll: (() => void) | null = null
  let handleWheel: ((event: WheelEvent) => void) | null = null
  let handleRouteSpin: ((event: Event) => void) | null = null
  let handlePageShow: (() => void) | null = null
  let handleVisibilityChange: (() => void) | null = null
  let handleViewportResize: (() => void) | null = null
  let stopRouteWatch: (() => void) | null = null
  let textGeometry: TextGeometry | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let glassMat: THREE.MeshBasicMaterial | null = null
  let rendererElement: HTMLCanvasElement | null = null
  let resizeObserver: ResizeObserver | null = null
  let hasDispatchedReady = false
  let scrollStopTimer: number | null = null
  let sizeStabilizationFrameId: number | null = null

  onMounted(() => {
    if (!container.value) return

    const W = container.value.clientWidth || 200
    const H = container.value.clientHeight || 100

    const localScene = new THREE.Scene()
    scene = localScene

    const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 200)
    camera.position.z = 7.5

    const renderCanvas = document.createElement('canvas')
    renderCanvas.style.backgroundColor = 'transparent'
    renderCanvas.style.display = 'block'

    const localRenderer = new THREE.WebGLRenderer({
      canvas: renderCanvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer = localRenderer
    localRenderer.setClearColor(0x000000, 0)
    localRenderer.setSize(W * heroScaleFactor, H * heroScaleFactor, false)
    localRenderer.domElement.style.width = '100%'
    localRenderer.domElement.style.height = '100%'
    localRenderer.domElement.style.backgroundColor = 'transparent'
    localRenderer.domElement.style.display = 'block'
    localRenderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
    localRenderer.toneMapping = THREE.NoToneMapping
    localRenderer.toneMappingExposure = 1
    rendererElement = localRenderer.domElement
    container.value.appendChild(rendererElement)

    const localGlassMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
    })
    glassMat = localGlassMat

    const logoGroup = new THREE.Group()
    localScene.add(logoGroup)

    let textMesh: THREE.Mesh | undefined
    let lastKnownScrollTop = 0
    let previousRoutePath = route.path
    let currentRotationTargetY = baseRotationY
    let scrollRotationTargetY = baseRotationY
    let needsRender = true
    let lastFrameTime = 0
    let lastScrollSampleTime = performance.now()
    let lastScrollSampleTop = 0
    let currentScrollVelocity = 0
    let shouldReturnFromMomentum = false
    let pendingRouteSpin: HeaderLogoRouteSpinDetail | null = null
    let lastAppliedRouteSpinSequence = 0
    let lastSyncedRendererWidth = 0
    let lastSyncedRendererHeight = 0
    let remainingSizeStabilizationFrames = 0

    const getRouteIndex = (path: string) => {
      const index = routeOrder.indexOf(path)
      return index === -1 ? 0 : index
    }

    const isMobileViewport = () => window.innerWidth <= mobileBreakpoint
    const getRouteRotationDamping = () => mobileRouteRotationDamping
    const getRendererPixelRatio = () => Math.min(window.devicePixelRatio || 1, maxPixelRatio)

    const isScrollDrivenRoute = (path: string) => scrollDrivenRoutes.has(path) && !isMobileViewport()

    let rotationSyncMode: 'scroll' | 'scrollMomentum' | 'animated' =
      isScrollDrivenRoute(route.path) ? 'scroll' : 'animated'

    const getContinuousAngle = (desiredAngle: number, referenceAngle: number) => {
      const turns = Math.round((referenceAngle - desiredAngle) / fullRotation)
      return desiredAngle + turns * fullRotation
    }

    const normalizeWheelDelta = (event: WheelEvent) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return event.deltaY * lineScrollPixels
      }

      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return event.deltaY * window.innerHeight
      }

      return event.deltaY
    }

    const setRotationTargetFromScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      const progress = maxScroll === 0 ? 1 : Math.min(Math.max(lastKnownScrollTop / maxScroll, 0), 1)
      const desiredAngle = baseRotationY + progress * fullRotation
      const rotationReference = textMesh ? logoGroup.rotation.y : currentRotationTargetY
      scrollRotationTargetY = getContinuousAngle(desiredAngle, rotationReference)
    }

    const syncRotationTargetWithScroll = (referenceAngle: number) => {
      currentRotationTargetY = getContinuousAngle(scrollRotationTargetY, referenceAngle)
    }

    const syncStaticRotationAtTop = () => {
      shouldReturnFromMomentum = false
      currentRotationTargetY = baseRotationY
      scrollRotationTargetY = baseRotationY
      rotationSyncMode = 'animated'

      if (textMesh) {
        logoGroup.rotation.x = baseRotationX
        logoGroup.rotation.y = baseRotationY
      }
    }

    const getSharedRouteSpin = () => {
      if (typeof window === 'undefined') {
        return null
      }

      return (window as HeaderLogoRouteSpinWindow).__headerLogoRouteSpin ?? null
    }

    const applyRouteSpin = (detail: HeaderLogoRouteSpinDetail) => {
      shouldReturnFromMomentum = false
      pendingRouteSpin = detail
      lastAppliedRouteSpinSequence = Math.max(lastAppliedRouteSpinSequence, detail.sequence)
      scrollRotationTargetY = detail.targetAngle
      currentRotationTargetY = detail.targetAngle
      rotationSyncMode = 'animated'

      if (textMesh) {
        logoGroup.rotation.x = baseRotationX
        logoGroup.rotation.y = detail.startAngle
        pendingRouteSpin = null
      }

      requestRender()
    }

    const startScrollMomentum = (velocityOverride?: number) => {
      if (!isScrollDrivenRoute(route.path) || !textMesh) return

      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      const effectiveVelocity = velocityOverride ?? currentScrollVelocity

      if (maxScroll <= 0 || Math.abs(effectiveVelocity) < 10) {
        rotationSyncMode = 'scroll'
        currentRotationTargetY = scrollRotationTargetY
        requestRender()
        return
      }

      const anglePerPixel = fullRotation / maxScroll
      const extraAngle = THREE.MathUtils.clamp(
        effectiveVelocity * scrollMomentumDuration * anglePerPixel,
        -maxMomentumAngle,
        maxMomentumAngle,
      )

      if (Math.abs(extraAngle) < rotationSettleThreshold) {
        rotationSyncMode = 'scroll'
        currentRotationTargetY = scrollRotationTargetY
        requestRender()
        return
      }

      rotationSyncMode = 'scrollMomentum'
      shouldReturnFromMomentum = true
      currentRotationTargetY = getContinuousAngle(scrollRotationTargetY + extraAngle, logoGroup.rotation.y)
      requestRender()
    }

    function requestRender() {
      needsRender = true
      if (reqId !== null) return

      lastFrameTime = performance.now()
      reqId = requestAnimationFrame(animate)
    }

    const syncRendererSize = (force = false) => {
      if (!container.value) {
        return false
      }

      const nextWidth = container.value.clientWidth
      const nextHeight = container.value.clientHeight

      if (nextWidth <= 0 || nextHeight <= 0) {
        return false
      }

      const shouldSync =
        force
        || nextWidth !== lastSyncedRendererWidth
        || nextHeight !== lastSyncedRendererHeight

      if (!shouldSync) {
        return false
      }

      lastSyncedRendererWidth = nextWidth
      lastSyncedRendererHeight = nextHeight

      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      localRenderer.setPixelRatio(getRendererPixelRatio())
      localRenderer.setSize(nextWidth * heroScaleFactor, nextHeight * heroScaleFactor, false)
      localRenderer.domElement.style.width = '100%'
      localRenderer.domElement.style.height = '100%'

      requestRender()
      return true
    }

    const scheduleSizeStabilization = (force = false) => {
      if (force) {
        syncRendererSize(true)
      }

      remainingSizeStabilizationFrames = sizeStabilizationFrames

      if (sizeStabilizationFrameId !== null) {
        return
      }

      const stabilize = () => {
        sizeStabilizationFrameId = null
        syncRendererSize()
        requestRender()

        if (remainingSizeStabilizationFrames <= 0) {
          return
        }

        remainingSizeStabilizationFrames -= 1
        sizeStabilizationFrameId = requestAnimationFrame(stabilize)
      }

      sizeStabilizationFrameId = requestAnimationFrame(stabilize)
    }

    const dispatchReady = () => {
      if (hasDispatchedReady || !container.value) return

      const wrapper = container.value.closest('.logo-wrapper')
      if (!(wrapper instanceof HTMLElement)) return

      wrapper.dataset.threeReady = 'true'
      wrapper.dispatchEvent(new CustomEvent('logo3d-ready', { bubbles: true }))
      hasDispatchedReady = true
    }

    const fontLoader = new FontLoader()
    fontLoader.load('/fonts/inter-800-jg.typeface.json', (font) => {
      textGeometry = new TextGeometry(text || 'JG', {
        font,
        size: 3.2,
        depth: 0.6,
        curveSegments: 14,
        bevelEnabled: false,
      })

      textGeometry.center()

      textMesh = new THREE.Mesh(textGeometry, localGlassMat)
      logoGroup.add(textMesh)

      logoGroup.rotation.x = baseRotationX
      logoGroup.rotation.y = baseRotationY
      currentRotationTargetY = baseRotationY

      if (pendingRouteSpin) {
        logoGroup.rotation.y = pendingRouteSpin.startAngle
        currentRotationTargetY = pendingRouteSpin.targetAngle
        scrollRotationTargetY = pendingRouteSpin.targetAngle
        pendingRouteSpin = null
      }

      // Force one deterministic frame with loaded geometry before revealing wrappers.
      localRenderer.render(localScene, camera)
      needsRender = false
      dispatchReady()
      scheduleSizeStabilization(true)
    })

    const updateScrollRotation = () => {
      const now = performance.now()
      const nextScrollTop = window.scrollY || document.documentElement.scrollTop
      const deltaTime = Math.max((now - lastScrollSampleTime) / 1000, 0.001)
      const deltaScroll = nextScrollTop - lastScrollSampleTop

      currentScrollVelocity = deltaScroll / deltaTime
      lastScrollSampleTime = now
      lastScrollSampleTop = nextScrollTop
      lastKnownScrollTop = nextScrollTop

      if (!isScrollDrivenRoute(route.path)) {
        return
      }

      setRotationTargetFromScroll()
      shouldReturnFromMomentum = false
      syncRotationTargetWithScroll(textMesh ? logoGroup.rotation.y : currentRotationTargetY)
      rotationSyncMode = 'scroll'

      if (textMesh) {
        logoGroup.rotation.x = baseRotationX
        logoGroup.rotation.y = currentRotationTargetY
      }
    }

    handleResize = () => {
      if (!container.value) return

      syncRendererSize(true)

      if (route.path === '/' && !isScrollDrivenRoute(route.path)) {
        syncStaticRotationAtTop()
      } else if (isScrollDrivenRoute(route.path)) {
        updateScrollRotation()
      }

      requestRender()
    }

    handleScroll = () => {
      updateScrollRotation()

      if (!isScrollDrivenRoute(route.path)) {
        if (scrollStopTimer !== null) {
          globalThis.clearTimeout(scrollStopTimer)
          scrollStopTimer = null
        }
        return
      }

      if (scrollStopTimer !== null) {
        globalThis.clearTimeout(scrollStopTimer)
      }
      scrollStopTimer = globalThis.setTimeout(() => {
        scrollStopTimer = null
        startScrollMomentum()
      }, scrollStopDelayMs)
      requestRender()
    }

    handleWheel = (event: WheelEvent) => {
      if (!isScrollDrivenRoute(route.path)) {
        return
      }

      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const isAtBottom = maxScroll > 0 && scrollTop >= maxScroll - bottomScrollTolerance
      const deltaPixels = normalizeWheelDelta(event)

      if (!isAtBottom || deltaPixels <= 0) {
        return
      }

      currentScrollVelocity = deltaPixels * overscrollVelocityFactor
      lastKnownScrollTop = scrollTop
      setRotationTargetFromScroll()
      startScrollMomentum(currentScrollVelocity)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })
    handlePageShow = () => {
      scheduleSizeStabilization(true)
    }
    window.addEventListener('pageshow', handlePageShow)
    handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return
      }

      scheduleSizeStabilization(true)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    if (window.visualViewport) {
      handleViewportResize = () => {
        scheduleSizeStabilization(true)
      }
      window.visualViewport.addEventListener('resize', handleViewportResize)
    }
    handleRouteSpin = (event: Event) => {
      const detail = (event as CustomEvent<HeaderLogoRouteSpinDetail>).detail
      if (!detail) {
        return
      }

      applyRouteSpin(detail)
    }
    window.addEventListener('header-logo-route-spin', handleRouteSpin as EventListener)
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scheduleSizeStabilization(true)
      })
      resizeObserver.observe(container.value)
    }

    scheduleSizeStabilization(true)
    updateScrollRotation()

    stopRouteWatch = watch(
      () => route.fullPath,
      async () => {
        const fromPath = previousRoutePath
        const toPath = route.path
        const wasNearTop = lastKnownScrollTop <= topNavigationThreshold
        const fromIndex = getRouteIndex(fromPath)
        const toIndex = getRouteIndex(toPath)
        const shouldAnimateRouteTransition =
          fromIndex !== toIndex && (wasNearTop || fromPath === '/')

        await nextTick()

        const sharedRouteSpin = getSharedRouteSpin()
        const shouldApplySharedRouteSpin =
          sharedRouteSpin
          && sharedRouteSpin.fromPath === fromPath
          && sharedRouteSpin.toPath === toPath
          && sharedRouteSpin.sequence > lastAppliedRouteSpinSequence

        if (shouldApplySharedRouteSpin) {
          applyRouteSpin(sharedRouteSpin)
          if (isMobileViewport()) {
            scheduleSizeStabilization(true)
          }
          previousRoutePath = toPath
          return
        }

        if (isMobileViewport()) {
          scheduleSizeStabilization(true)
          previousRoutePath = toPath
          requestRender()
          return
        }

        if (toPath === '/') {
          if (isScrollDrivenRoute(toPath)) {
            rotationSyncMode = 'scroll'
            currentRotationTargetY = baseRotationY
            scrollRotationTargetY = baseRotationY
            logoGroup.rotation.x = baseRotationX
            logoGroup.rotation.y = baseRotationY
          } else {
            syncStaticRotationAtTop()
          }
          requestRender()
          previousRoutePath = toPath
          return
        }

        if (shouldAnimateRouteTransition) {
          const desiredTopAngle = getContinuousAngle(baseRotationY, currentRotationTargetY)
          scrollRotationTargetY = desiredTopAngle
          currentRotationTargetY = desiredTopAngle
          rotationSyncMode = 'animated'
        } else {
          currentRotationTargetY = getContinuousAngle(baseRotationY, currentRotationTargetY)
          scrollRotationTargetY = currentRotationTargetY
          rotationSyncMode = isScrollDrivenRoute(toPath) ? 'scroll' : 'animated'
          if (textMesh) {
            logoGroup.rotation.x = baseRotationX
            logoGroup.rotation.y = currentRotationTargetY
          }
        }

        requestRender()
        if (isMobileViewport()) {
          scheduleSizeStabilization(true)
        }
        previousRoutePath = toPath
      },
    )

    function animate(now: number) {
      reqId = null

      const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.08)
      lastFrameTime = now
      let isAnimating = false

      if (textMesh && rotationSyncMode === 'animated') {
        const nextRotationX = THREE.MathUtils.damp(
          logoGroup.rotation.x,
          baseRotationX,
          getRouteRotationDamping(),
          deltaSeconds,
        )
        const nextRotationY = THREE.MathUtils.damp(
          logoGroup.rotation.y,
          currentRotationTargetY,
          getRouteRotationDamping(),
          deltaSeconds,
        )

        isAnimating =
          Math.abs(nextRotationX - baseRotationX) > rotationSettleThreshold ||
          Math.abs(currentRotationTargetY - nextRotationY) > rotationSettleThreshold

        logoGroup.rotation.x = nextRotationX
        logoGroup.rotation.y = nextRotationY
      }

      if (textMesh && rotationSyncMode === 'scrollMomentum') {
        const nextRotationY = THREE.MathUtils.damp(
          logoGroup.rotation.y,
          currentRotationTargetY,
          getRouteRotationDamping(),
          deltaSeconds,
        )

        logoGroup.rotation.x = baseRotationX
        logoGroup.rotation.y = nextRotationY

        const distanceToTarget = Math.abs(currentRotationTargetY - nextRotationY)

        if (shouldReturnFromMomentum && distanceToTarget <= momentumSettleThreshold) {
          shouldReturnFromMomentum = false
          currentRotationTargetY = scrollRotationTargetY
          isAnimating = true
        } else {
          isAnimating = distanceToTarget > rotationSettleThreshold
          if (!shouldReturnFromMomentum && !isAnimating) {
            rotationSyncMode = 'scroll'
            logoGroup.rotation.y = scrollRotationTargetY
          }
        }
      }

      if (needsRender || isAnimating) {
        localRenderer.render(localScene, camera)
        needsRender = false
      }

      if (needsRender || isAnimating) {
        reqId = requestAnimationFrame(animate)
      }
    }

    requestRender()
  })

  onUnmounted(() => {
    if (stopRouteWatch) {
      stopRouteWatch()
      stopRouteWatch = null
    }

    if (handleResize) {
      window.removeEventListener('resize', handleResize)
      handleResize = null
    }

    if (handleScroll) {
      window.removeEventListener('scroll', handleScroll)
      handleScroll = null
    }

    if (handleWheel) {
      window.removeEventListener('wheel', handleWheel)
      handleWheel = null
    }

    if (handleRouteSpin) {
      window.removeEventListener('header-logo-route-spin', handleRouteSpin as EventListener)
      handleRouteSpin = null
    }

    if (handlePageShow) {
      window.removeEventListener('pageshow', handlePageShow)
      handlePageShow = null
    }

    if (handleVisibilityChange) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      handleVisibilityChange = null
    }

    if (window.visualViewport && handleViewportResize) {
      window.visualViewport.removeEventListener('resize', handleViewportResize)
      handleViewportResize = null
    }

    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }

    if (scrollStopTimer !== null) {
      globalThis.clearTimeout(scrollStopTimer)
      scrollStopTimer = null
    }

    if (sizeStabilizationFrameId !== null) {
      cancelAnimationFrame(sizeStabilizationFrameId)
      sizeStabilizationFrameId = null
    }

    if (reqId !== null) {
      cancelAnimationFrame(reqId)
      reqId = null
    }

    if (textGeometry) {
      textGeometry.dispose()
      textGeometry = null
    }

    if (renderer) {
      renderer.dispose()
      renderer = null
    }

    if (scene) {
      scene.clear()
      scene = null
    }

    if (glassMat) {
      glassMat.dispose()
      glassMat = null
    }

    if (container.value && rendererElement && container.value.contains(rendererElement)) {
      rendererElement.remove()
    }
    rendererElement = null
  })
}
