import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// ============================================================
// CURSOR
// ============================================================
const cursor = document.getElementById('cursor') as HTMLDivElement
const cursorFollower = document.getElementById('cursor-follower') as HTMLDivElement

let mouseX = 0, mouseY = 0
let followerX = 0, followerY = 0

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
  cursor.style.left = mouseX + 'px'
  cursor.style.top = mouseY + 'px'
})

const animateCursor = () => {
  followerX += (mouseX - followerX) * 0.12
  followerY += (mouseY - followerY) * 0.12
  cursorFollower.style.left = followerX + 'px'
  cursorFollower.style.top = followerY + 'px'
  requestAnimationFrame(animateCursor)
}
animateCursor()

// ============================================================
// THREE.JS — LOADING SCREEN
// ============================================================
const canvasContainer = document.getElementById('canvas-container') as HTMLDivElement
const loadingScreen   = document.getElementById('loading-screen') as HTMLDivElement
const loadingBar      = document.getElementById('loading-bar') as HTMLDivElement
const loadingText     = document.getElementById('loading-text') as HTMLParagraphElement
const mainContent     = document.getElementById('main-content') as HTMLDivElement

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x03030a, 0.06)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x03030a, 1)
canvasContainer.appendChild(renderer.domElement)

// Central icosahedron group
const centerGroup = new THREE.Group()
scene.add(centerGroup)

const geometry = new THREE.IcosahedronGeometry(1.5, 1)

const solidMaterial = new THREE.MeshStandardMaterial({
  color: 0x03030a,
  metalness: 0.9,
  roughness: 0.1,
  wireframe: false,
  transparent: true,
  opacity: 0.95,
})

const wireframeMaterial = new THREE.LineBasicMaterial({
  color: 0x00e5ff,
  transparent: true,
  opacity: 0.25
})

const mesh = new THREE.Mesh(geometry, solidMaterial)
centerGroup.add(mesh)

const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), wireframeMaterial)
wireframe.scale.setScalar(1.02)
centerGroup.add(wireframe)

// Inner glowing orb
const innerGeo = new THREE.SphereGeometry(0.7, 32, 32)
const innerMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.04 })
const innerOrb = new THREE.Mesh(innerGeo, innerMat)
centerGroup.add(innerOrb)

// Ring
const ringGeo = new THREE.TorusGeometry(2.2, 0.005, 2, 128)
const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.15 })
const ring = new THREE.Mesh(ringGeo, ringMat)
ring.rotation.x = Math.PI / 2
centerGroup.add(ring)

// Particles
const particlesCount = 2000
const posArray = new Float32Array(particlesCount * 3)
for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 40
}
const particlesGeo = new THREE.BufferGeometry()
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
const particlesMat = new THREE.PointsMaterial({
  size: 0.015,
  color: 0x00e5ff,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending
})
const particlesMesh = new THREE.Points(particlesGeo, particlesMat)
scene.add(particlesMesh)

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.3))
const light1 = new THREE.PointLight(0x00e5ff, 4, 20)
light1.position.set(3, 3, 3)
scene.add(light1)
const light2 = new THREE.PointLight(0xbf00ff, 2, 20)
light2.position.set(-3, -3, -3)
scene.add(light2)

// Animation loop
const clock = new THREE.Clock()
let isTransitioning = false

const tick = () => {
  const t = clock.getElapsedTime()

  centerGroup.rotation.y = t * 0.15
  centerGroup.rotation.x = t * 0.07
  centerGroup.position.y = Math.sin(t * 0.6) * 0.15

  particlesMesh.rotation.y = -t * 0.04
  particlesMesh.rotation.x = t * 0.02

  light1.position.x = Math.sin(t * 0.5) * 4
  light1.position.z = Math.cos(t * 0.5) * 4

  if (!isTransitioning) {
    const s = 1 + Math.sin(t * 2) * 0.08
    innerOrb.scale.set(s, s, s)
    wireframeMaterial.opacity = 0.2 + Math.sin(t * 1.5) * 0.08
  }

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// ============================================================
// LOADING PROGRESS
// ============================================================
const loadingMessages = ['INITIALISATION', 'CHARGEMENT', 'CONSTRUCTION', 'PRÊT']
let progress = 0

const fakeLoading = setInterval(() => {
  progress += Math.random() * 12
  if (progress >= 100) {
    progress = 100
    clearInterval(fakeLoading)
    loadingText.innerText = loadingMessages[3]
    onLoadComplete()
    return
  }
  const idx = Math.floor((progress / 100) * (loadingMessages.length - 1))
  loadingText.innerText = loadingMessages[idx]
  loadingBar.style.width = `${progress}%`
}, 120)

const loadingContent = document.querySelector('.loading-content') as HTMLDivElement

function onLoadComplete() {
  gsap.to(loadingContent, {
    opacity: 0, duration: 0.8, y: 20, ease: 'power2.inOut',
    onComplete: () => {
      loadingContent.style.display = 'none'
      startTransition()
    }
  })
}

function startTransition() {
  if (isTransitioning) return
  isTransitioning = true

  const tl = gsap.timeline()

  tl.to(particlesMat, { size: 0, opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
  tl.to(wireframeMaterial, { opacity: 0, duration: 0.8, ease: 'power2.in' }, 0)
  tl.to(solidMaterial.color, { r: 0, g: 0.898, b: 1, duration: 0.6, ease: 'power2.in' }, 0.2)
  tl.to(solidMaterial, { opacity: 1, metalness: 0.1, roughness: 0.9, duration: 0.6 }, 0.2)
  tl.to(centerGroup.scale, { x: 25, y: 25, z: 25, duration: 1.5, ease: 'power4.inOut' }, 0.4)
  tl.to(loadingScreen, {
    opacity: 0, duration: 0.8, ease: 'power2.inOut',
    onComplete: () => {
      loadingScreen.style.display = 'none'
      renderer.dispose()
      mainContent.classList.add('visible')
      initPortfolio()
    }
  }, 1.3)
}

// ============================================================
// PORTFOLIO INTERACTIONS
// ============================================================
function initPortfolio() {
  // Show nav
  const nav = document.getElementById('nav') as HTMLElement
  setTimeout(() => nav.classList.add('visible'), 400)

  // Attach cursor hover effects to interactive elements
  document.querySelectorAll('a, button, .project-card, .stat-card, .interest-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorFollower.style.transform = 'translate(-50%,-50%) scale(1.6)'
      cursorFollower.style.borderColor = 'var(--accent)'
    })
    el.addEventListener('mouseleave', () => {
      cursorFollower.style.transform = 'translate(-50%,-50%) scale(1)'
      cursorFollower.style.borderColor = 'rgba(0,229,255,0.5)'
    })
  })

  // Scroll-reveal observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view')
        // Also trigger children .reveal-item
        entry.target.querySelectorAll('.reveal-item').forEach((el, i) => {
          setTimeout(() => el.classList.add('in-view'), i * 100)
        })
      }
    })
  }, { threshold: 0.12 })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

  // Hero is always visible
  document.querySelector('.hero-section')?.classList.add('in-view')

  // Active nav link on scroll
  const sections = document.querySelectorAll('.section')
  const navLinks = document.querySelectorAll('.nav-link')
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('data-section') === id)
        })
      }
    })
  }, { threshold: 0.4 })

  sections.forEach(s => scrollObserver.observe(s))

  // Hero canvas — subtle floating geometry (lightweight)
  initHeroBackground()
}

function initHeroBackground() {
  const container = document.getElementById('hero-canvas')
  if (!container) return

  const s = new THREE.Scene()
  const c = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  c.position.z = 8

  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  r.setSize(window.innerWidth, window.innerHeight)
  r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  r.setClearColor(0x000000, 0)
  container.appendChild(r.domElement)

  // Floating torus knot
  const knotGeo = new THREE.TorusKnotGeometry(2.5, 0.3, 100, 16)
  const knotMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.04
  })
  const knot = new THREE.Mesh(knotGeo, knotMat)
  knot.position.set(6, 0, -2)
  s.add(knot)

  // Dots
  const dotsGeo = new THREE.BufferGeometry()
  const dotsArr = new Float32Array(600 * 3)
  for (let i = 0; i < 600 * 3; i++) dotsArr[i] = (Math.random() - 0.5) * 20
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(dotsArr, 3))
  const dotsMat = new THREE.PointsMaterial({ size: 0.02, color: 0x00e5ff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending })
  s.add(new THREE.Points(dotsGeo, dotsMat))

  const clock2 = new THREE.Clock()
  const loop = () => {
    const t = clock2.getElapsedTime()
    knot.rotation.x = t * 0.1
    knot.rotation.y = t * 0.07
    r.render(s, c)
    requestAnimationFrame(loop)
  }
  loop()

  window.addEventListener('resize', () => {
    c.aspect = window.innerWidth / window.innerHeight
    c.updateProjectionMatrix()
    r.setSize(window.innerWidth, window.innerHeight)
  })
}
