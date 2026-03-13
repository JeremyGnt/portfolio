import { nextTick, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

const baseRotationX = 0
const baseRotationY = 0
const rotationLerpFactor = 0.08
const fullRotation = Math.PI * 2
const topNavigationThreshold = 24
const routeOrder = ['/', '/experience', '/projects', '/contact']
const heroScaleFactor = 6

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

  onMounted(() => {
    if (!container.value) return

    const W = container.value.clientWidth || 200
    const H = container.value.clientHeight || 100

    const localScene = new THREE.Scene()
    scene = localScene

    const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 200)
    camera.position.z = 7.5

    const localRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer = localRenderer
    localRenderer.setSize(W * heroScaleFactor, H * heroScaleFactor, false)
    localRenderer.domElement.style.width = '100%'
    localRenderer.domElement.style.height = '100%'
    localRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
      currentRotationTargetY = getContinuousAngle(desiredAngle, currentRotationTargetY)
    }

    const fontLoader = new FontLoader()
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
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
    })

    const updateScrollRotation = () => {
      lastKnownScrollTop = window.scrollY || document.documentElement.scrollTop
      setRotationTargetFromScroll()
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
      localRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      updateScrollRotation()
    }

    handleScroll = () => {
      updateScrollRotation()
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
          currentRotationTargetY = baseRotationY
          logoGroup.rotation.x = baseRotationX
          logoGroup.rotation.y = baseRotationY
          previousRoutePath = toPath
          return
        }

        if (wasNearTop && fromIndex !== toIndex) {
          const direction = toIndex > fromIndex ? 1 : -1
          const desiredTopAngle = getContinuousAngle(baseRotationY, currentRotationTargetY)
          currentRotationTargetY = desiredTopAngle + direction * fullRotation
        } else {
          updateScrollRotation()
        }

        previousRoutePath = toPath
      },
    )

    const animate = () => {
      reqId = requestAnimationFrame(animate)

      if (textMesh) {
        logoGroup.rotation.x = THREE.MathUtils.lerp(logoGroup.rotation.x, baseRotationX, rotationLerpFactor)
        logoGroup.rotation.y = THREE.MathUtils.lerp(logoGroup.rotation.y, currentRotationTargetY, rotationLerpFactor)
      }

      localRenderer.render(localScene, camera)
    }

    animate()
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
