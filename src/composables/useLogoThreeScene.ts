import { nextTick, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

const baseRotationX = 0
const baseRotationY = 0
const routeRotationDamping = 7
const fullRotation = Math.PI * 2
const topNavigationThreshold = 24
const routeOrder = ['/', '/experience', '/projects', '/contact']
const heroScaleFactor = 4
const maxPixelRatio = 1.5
const rotationSettleThreshold = 0.001
const momentumSettleThreshold = 0.01
const scrollStopDelayMs = 70
const scrollMomentumDuration = 0.42
const maxMomentumAngle = Math.PI * 0.4

export function useLogoThreeScene(container: Ref<HTMLElement | null>, text?: string) {
  const route = useRoute()

  let reqId: number | null = null
  let handleResize: (() => void) | null = null
  let handleScroll: (() => void) | null = null
  let stopRouteWatch: (() => void) | null = null
  let textGeometry: TextGeometry | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let glassMat: THREE.MeshBasicMaterial | null = null
  let rendererElement: HTMLCanvasElement | null = null
  let hasDispatchedReady = false
  let scrollStopTimer: number | null = null

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
    let rotationSyncMode: 'scroll' | 'scrollMomentum' | 'animated' = route.path === '/' ? 'scroll' : 'animated'

    const getRouteIndex = (path: string) => {
      const index = routeOrder.indexOf(path)
      return index === -1 ? 0 : index
    }

    const getContinuousAngle = (desiredAngle: number, referenceAngle: number) => {
      const turns = Math.round((referenceAngle - desiredAngle) / fullRotation)
      return desiredAngle + turns * fullRotation
    }

    const setRotationTargetFromScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      const progress = maxScroll === 0 ? 1 : Math.min(Math.max(lastKnownScrollTop / maxScroll, 0), 1)
      const desiredAngle = baseRotationY + progress * fullRotation
      const rotationReference = textMesh ? logoGroup.rotation.y : currentRotationTargetY
      scrollRotationTargetY = getContinuousAngle(desiredAngle, rotationReference)
    }

    const startScrollMomentum = () => {
      if (route.path !== '/' || !textMesh) return

      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      if (maxScroll <= 0 || Math.abs(currentScrollVelocity) < 10) {
        rotationSyncMode = 'scroll'
        currentRotationTargetY = scrollRotationTargetY
        requestRender()
        return
      }

      const anglePerPixel = fullRotation / maxScroll
      const extraAngle = THREE.MathUtils.clamp(
        currentScrollVelocity * scrollMomentumDuration * anglePerPixel,
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

    const requestRender = () => {
      needsRender = true
      if (reqId !== null) return

      lastFrameTime = performance.now()
      reqId = requestAnimationFrame(animate)
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

      // Force one deterministic frame with loaded geometry before revealing wrappers.
      localRenderer.render(localScene, camera)
      needsRender = false
      dispatchReady()
    })

    const updateScrollRotation = () => {
      const now = performance.now()
      const nextScrollTop = window.scrollY || document.documentElement.scrollTop
      const deltaTime = Math.max((now - lastScrollSampleTime) / 1000, 0.001)
      const deltaScroll = nextScrollTop - lastScrollSampleTop

      currentScrollVelocity = deltaScroll / deltaTime
      lastScrollSampleTime = now
      lastScrollSampleTop = nextScrollTop
      lastKnownScrollTop = window.scrollY || document.documentElement.scrollTop
      setRotationTargetFromScroll()
      rotationSyncMode = 'scroll'
      shouldReturnFromMomentum = false
      currentRotationTargetY = scrollRotationTargetY

      if (textMesh) {
        logoGroup.rotation.x = baseRotationX
        logoGroup.rotation.y = currentRotationTargetY
      }
    }

    handleResize = () => {
      if (!container.value) return
      const newW = container.value.clientWidth
      const newH = container.value.clientHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      localRenderer.setSize(newW * heroScaleFactor, newH * heroScaleFactor, false)
      localRenderer.domElement.style.width = '100%'
      localRenderer.domElement.style.height = '100%'
      localRenderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
      updateScrollRotation()
      requestRender()
    }

    handleScroll = () => {
      updateScrollRotation()
      if (scrollStopTimer !== null) {
        globalThis.clearTimeout(scrollStopTimer)
      }
      scrollStopTimer = globalThis.setTimeout(() => {
        scrollStopTimer = null
        startScrollMomentum()
      }, scrollStopDelayMs)
      requestRender()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    updateScrollRotation()

    stopRouteWatch = watch(
      () => route.fullPath,
      async () => {
        const fromPath = previousRoutePath
        const toPath = route.path
        const wasNearTop = lastKnownScrollTop <= topNavigationThreshold
        const fromIndex = getRouteIndex(fromPath)
        const toIndex = getRouteIndex(toPath)

        await nextTick()

        if (toPath === '/') {
          rotationSyncMode = 'scroll'
          currentRotationTargetY = baseRotationY
          scrollRotationTargetY = baseRotationY
          logoGroup.rotation.x = baseRotationX
          logoGroup.rotation.y = baseRotationY
          requestRender()
          previousRoutePath = toPath
          return
        }

        if (wasNearTop && fromIndex !== toIndex) {
          rotationSyncMode = 'animated'
          const direction = toIndex > fromIndex ? 1 : -1
          const desiredTopAngle = getContinuousAngle(baseRotationY, currentRotationTargetY)
          currentRotationTargetY = desiredTopAngle + direction * fullRotation
        } else {
          updateScrollRotation()
        }

        requestRender()
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
          routeRotationDamping,
          deltaSeconds,
        )
        const nextRotationY = THREE.MathUtils.damp(
          logoGroup.rotation.y,
          currentRotationTargetY,
          routeRotationDamping,
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
          routeRotationDamping,
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

    if (scrollStopTimer !== null) {
      globalThis.clearTimeout(scrollStopTimer)
      scrollStopTimer = null
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
