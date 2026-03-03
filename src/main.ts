import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// --- THREE.JS SCENE SETUP ---
const canvasContainer = document.getElementById('canvas-container') as HTMLDivElement
const loadingScreen = document.getElementById('loading-screen') as HTMLDivElement
const loadingBar = document.getElementById('loading-bar') as HTMLDivElement
const loadingText = document.getElementById('loading-text') as HTMLParagraphElement
const mainContent = document.getElementById('main-content') as HTMLDivElement

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x050505, 0.08)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x050505, 1) // Dark background
canvasContainer.appendChild(renderer.domElement)

// --- OBJECTS ---
// Group to hold the central shape
const centerGroup = new THREE.Group()
scene.add(centerGroup)

// Icosahedron
const geometry = new THREE.IcosahedronGeometry(1.5, 1)

// Materials
const solidMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
  metalness: 0.8,
  roughness: 0.2,
  wireframe: false,
  transparent: true,
  opacity: 0.9,
})

const wireframeMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3
})

const mesh = new THREE.Mesh(geometry, solidMaterial)
centerGroup.add(mesh)

const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), wireframeMaterial)
// Slightly scale up the wireframe
wireframe.scale.setScalar(1.02)
centerGroup.add(wireframe)

// Inner glowing orb
const innerGeo = new THREE.SphereGeometry(0.8, 32, 32)
const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 })
const innerOrb = new THREE.Mesh(innerGeo, innerMat)
centerGroup.add(innerOrb)

// Particles
const particlesGeo = new THREE.BufferGeometry()
const particlesCount = 1500
const posArray = new Float32Array(particlesCount * 3)
const endPosArray = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount * 3; i++) {
  // Initial position (cube)
  posArray[i] = (Math.random() - 0.5) * 50

  // End position (more spherical / clustered)
  endPosArray[i] = (Math.random() - 0.5) * (Math.random() * 20)
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
particlesGeo.setAttribute('aEndPosition', new THREE.BufferAttribute(endPosArray, 3))

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  color: 0xffffff,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending
})

const particlesMesh = new THREE.Points(particlesGeo, particlesMaterial)
scene.add(particlesMesh)

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight1 = new THREE.PointLight(0xffffff, 3)
pointLight1.position.set(2, 3, 4)
scene.add(pointLight1)

const pointLight2 = new THREE.PointLight(0xaaaaaa, 2)
pointLight2.position.set(-2, -3, -4)
scene.add(pointLight2)

// --- ANIMATION LOOP ---
const clock = new THREE.Clock()

let isTransitioning = false

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Rotate objects
  centerGroup.rotation.y = elapsedTime * 0.2
  centerGroup.rotation.x = elapsedTime * 0.1

  // Float effect
  centerGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.2

  // Rotate particles
  particlesMesh.rotation.y = -elapsedTime * 0.05

  if (!isTransitioning) {
    // Breathe effect for inner orb
    const orbScale = 1 + Math.sin(elapsedTime * 2) * 0.1
    innerOrb.scale.set(orbScale, orbScale, orbScale)
  }

  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// --- SIMULATE LOADING & TRANSITION ---
let progress = 0
const fakeLoading = setInterval(() => {
  progress += Math.random() * 15
  if (progress >= 100) {
    progress = 100
    clearInterval(fakeLoading)
    onLoadComplete()
  }

  loadingBar.style.width = `${progress}%`
  loadingText.innerText = `${Math.floor(progress)}%`
}, 100)

const loadingContent = document.querySelector('.loading-content') as HTMLDivElement

function onLoadComplete() {
  // Fade out loading bar/text
  gsap.to(loadingContent, {
    opacity: 0,
    duration: 1,
    y: 20,
    ease: "power2.inOut",
    onComplete: () => {
      loadingContent.style.display = 'none'
      // Start transition automatically
      startTransition()
    }
  })
}

// Start the transition automatically after loading is done
function startTransition() {
  if (isTransitioning) return
  isTransitioning = true

  // Transition Timeline
  const tl = gsap.timeline()

  // Animate particles away
  tl.to(particlesMaterial, {
    size: 0,
    opacity: 0,
    duration: 1.5,
    ease: "power2.inOut"
  }, 0)

  // Flash effect on the central mesh
  tl.to(solidMaterial.color, {
    r: 1, g: 1, b: 1,
    duration: 0.5,
    ease: "power2.in"
  }, 0)

  tl.to(solidMaterial, {
    opacity: 1,
    metalness: 0,
    roughness: 1,
    duration: 0.5
  }, 0)

  // Expand the center group to engulf the screen
  tl.to(centerGroup.scale, {
    x: 20, y: 20, z: 20,
    duration: 1.5,
    ease: "power4.inOut"
  }, 0.2)

  // Fade out the entire loading screen html container
  tl.to(loadingScreen, {
    opacity: 0,
    duration: 1,
    ease: "power2.inOut",
    onComplete: () => {
      loadingScreen.style.display = 'none'

      // Stop rendering Three.js to save performance since it's hidden behind a solid white background now
      renderer.dispose()

      // Reveal the main content beautifully
      mainContent.classList.add('visible')
    }
  }, 1.2)
}
