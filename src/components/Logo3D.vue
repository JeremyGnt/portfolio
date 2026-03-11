<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

const props = defineProps<{
  text?: string
}>()

const container = ref<HTMLElement | null>(null)
const route = useRoute()
let reqId: number | null = null
let handleResize: (() => void) | null = null
let handleScroll: (() => void) | null = null
const baseRotationX = 0
const baseRotationY = 0
const rotationLerpFactor = 0.08
const fullRotation = Math.PI * 2
const topNavigationThreshold = 24
const routeOrder = ['/', '/experience', '/projects', '/contact']

onMounted(() => {
  if (!container.value) return

  // Canvas dimensions — fills container
  const W = container.value.clientWidth || 200
  const H = container.value.clientHeight || 100

  // -------------------------------------------------------
  // SCENE
  // -------------------------------------------------------
  const scene = new THREE.Scene()

  // Camera — tight FOV and closer Z to fill the frame
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 200)
  camera.position.z = 7.5

  // Renderer — responsive
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  // We use a high internal resolution (scale factor = 6) to keep the native canvas attributes inherently huge.
  // This completely eliminates pixelation when GSAP scales up the DOM container.
  const heroScaleFactor = 6
  renderer.setSize(W * heroScaleFactor, H * heroScaleFactor, false)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.value.appendChild(renderer.domElement)

  // -------------------------------------------------------
  // LIGHTS
  // -------------------------------------------------------
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))

  const dirLight = new THREE.DirectionalLight(0xe0ffff, 3)
  dirLight.position.set(5, 5, 5)
  scene.add(dirLight)

  const cyanPt = new THREE.PointLight(0x00ffff, 10, 40)
  cyanPt.position.set(-4, 2, 4)
  scene.add(cyanPt)

  const magentaPt = new THREE.PointLight(0xff00ff, 8, 40)
  magentaPt.position.set(4, -2, 3)
  scene.add(magentaPt)

  // -------------------------------------------------------
  // GLASS MATERIAL
  // -------------------------------------------------------
  // We use a BasicMaterial internally to ensure 0 shading (perfectly 2D white text) initially.
  // The physical 'glass effect' is turned off. Since the original design wants it to be perfectly white
  // matching HTML, we stick to BasicMaterial for a consistent look.
  const glassMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
  })

  // -------------------------------------------------------
  // TEXT GEOMETRY
  // -------------------------------------------------------
  const logoGroup = new THREE.Group()
  scene.add(logoGroup)

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
  fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    (font) => {
      const geo = new TextGeometry(props.text || 'JG', {
        font,
        size: 3.2,
        depth: 0.4,       // Subtle depth
        curveSegments: 14,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 5,
      })

      geo.center()

      textMesh = new THREE.Mesh(geo, glassMat)
      logoGroup.add(textMesh)

      logoGroup.rotation.x = baseRotationX
      logoGroup.rotation.y = baseRotationY
      currentRotationTargetY = baseRotationY
    }
  )

  const updateScrollRotation = () => {
    lastKnownScrollTop = window.scrollY || document.documentElement.scrollTop
    setRotationTargetFromScroll()
  }

  // -------------------------------------------------------
  // RESIZE
  // -------------------------------------------------------
  handleResize = () => {
    if (!container.value) return
    const newW = container.value.clientWidth
    const newH = container.value.clientHeight
    camera.aspect = newW / newH
    camera.updateProjectionMatrix()
    renderer.setSize(newW * heroScaleFactor, newH * heroScaleFactor, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    updateScrollRotation()
  }

  handleScroll = () => {
    updateScrollRotation()
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, { passive: true })
  updateScrollRotation()

  watch(
    () => route.fullPath,
    async () => {
      const fromPath = previousRoutePath
      const toPath = route.path
      const wasNearTop = lastKnownScrollTop <= topNavigationThreshold
      const fromIndex = getRouteIndex(fromPath)
      const toIndex = getRouteIndex(toPath)

      await nextTick()

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

  // -------------------------------------------------------
  // RENDER LOOP
  // -------------------------------------------------------
  const clock = new THREE.Clock()

  const animate = () => {
    reqId = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    if (textMesh) {
      logoGroup.rotation.x = THREE.MathUtils.lerp(logoGroup.rotation.x, baseRotationX, rotationLerpFactor)
      logoGroup.rotation.y = THREE.MathUtils.lerp(
        logoGroup.rotation.y,
        currentRotationTargetY,
        rotationLerpFactor,
      )
    }

    renderer.render(scene, camera)
  }

  animate()

  // -------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------
  onUnmounted(() => {
    if (handleResize) window.removeEventListener('resize', handleResize)
    if (handleScroll) window.removeEventListener('scroll', handleScroll)
    if (reqId) cancelAnimationFrame(reqId)
    renderer.dispose()
    scene.clear()
    glassMat.dispose()
  })
})
</script>

<template>
  <div ref="container" class="logo-3d"></div>
</template>

<style scoped>
.logo-3d {
  width: 100%;
  height: 100%;
  min-width: 108px;
  min-height: 42px;
}
</style>

