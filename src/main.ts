import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

/* ============================================================
   Year
   ============================================================ */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear().toString()

/* ============================================================
   Three.js Background — Floating Particles
   ============================================================ */
const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 0)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200)
camera.position.z = 50

/* --- Particles --- */
const PARTICLE_COUNT = 600
const positions = new Float32Array(PARTICLE_COUNT * 3)
const colors = new Float32Array(PARTICLE_COUNT * 3)

const palette = [
  new THREE.Color('#7c6ff7'),
  new THREE.Color('#c084fc'),
  new THREE.Color('#38bdf8'),
  new THREE.Color('#818cf8'),
]

for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 120
  positions[i * 3 + 1] = (Math.random() - 0.5) * 100
  positions[i * 3 + 2] = (Math.random() - 0.5) * 80

  const c = palette[Math.floor(Math.random() * palette.length)]
  colors[i * 3]     = c.r
  colors[i * 3 + 1] = c.g
  colors[i * 3 + 2] = c.b
}

const geo = new THREE.BufferGeometry()
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const mat = new THREE.PointsMaterial({
  size: 0.35,
  vertexColors: true,
  transparent: true,
  opacity: 0.7,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})

const particles = new THREE.Points(geo, mat)
scene.add(particles)

/* --- Ambient glow meshes --- */
const glowGeo = new THREE.SphereGeometry(8, 16, 16)
const glowColors = ['#7c6ff7', '#c084fc', '#38bdf8']
const glowMeshes: THREE.Mesh[] = []

glowColors.forEach((color, i) => {
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.04,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(glowGeo, glowMat)
  mesh.position.set(
    (i - 1) * 25,
    (Math.random() - 0.5) * 20,
    -20
  )
  scene.add(mesh)
  glowMeshes.push(mesh)
})

/* --- Mouse parallax --- */
let mouseX = 0
let mouseY = 0
let targetX = 0
let targetY = 0

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2
})

/* --- Resize --- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/* --- Animation loop --- */
let t = 0

function animate() {
  requestAnimationFrame(animate)
  t += 0.003

  // Smooth mouse follow
  targetX += (mouseX - targetX) * 0.04
  targetY += (mouseY - targetY) * 0.04

  particles.rotation.y = t * 0.05 + targetX * 0.15
  particles.rotation.x = targetY * 0.1

  glowMeshes.forEach((mesh, i) => {
    mesh.position.y = Math.sin(t + i * 1.5) * 8
    mesh.position.x = (i - 1) * 25 + Math.cos(t * 0.7 + i) * 5
  })

  renderer.render(scene, camera)
}

animate()

/* ============================================================
   Page Navigation
   ============================================================ */
type PageId = 'about' | 'experience' | 'projects' | 'contact'

let currentPage: PageId = 'about'

const overlay = document.createElement('div')
overlay.className = 'page-transition-overlay'
document.body.appendChild(overlay)

function navigateTo(pageId: PageId) {
  if (pageId === currentPage) return

  // Fade in overlay
  overlay.classList.add('active')

  setTimeout(() => {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))

    // Show target page
    const target = document.getElementById(`page-${pageId}`)
    if (target) {
      target.classList.add('active')
      // Reset scroll
      window.scrollTo({ top: 0 })
    }

    // Update nav buttons
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-page') === pageId)
    })

    currentPage = pageId

    // Trigger reveal animations
    triggerReveal()

    // Fade out overlay
    overlay.classList.remove('active')
  }, 250)
}

/* ============================================================
   Nav click handlers
   ============================================================ */
function setupNavHandlers() {
  document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page') as PageId
      navigateTo(page)
      // Close mobile menu if open
      closeMobileMenu()
    })
  })
}

setupNavHandlers()

/* ============================================================
   Hamburger / Mobile Menu
   ============================================================ */
const hamburger = document.getElementById('nav-hamburger')!
const mobileMenu = document.getElementById('mobile-menu')!

function closeMobileMenu() {
  hamburger.classList.remove('open')
  mobileMenu.classList.remove('open')
}

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open')
  mobileMenu.classList.toggle('open')
})

// Close on outside click
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target as Node) && !mobileMenu.contains(e.target as Node)) {
    closeMobileMenu()
  }
})

/* ============================================================
   Reveal on scroll / load
   ============================================================ */
function triggerReveal() {
  // Get all reveal elements in the current active page
  const activePage = document.querySelector('.page.active')
  if (!activePage) return

  const revealEls = activePage.querySelectorAll('.reveal')
  revealEls.forEach((el, i) => {
    // Reset
    gsap.set(el, { opacity: 0, y: 24 })
    // Animate in
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      delay: i * 0.08,
      ease: 'power2.out',
    })
  })
}

// Initial reveal on page load
const initialPage = document.getElementById('page-about')
if (initialPage) initialPage.classList.add('active')

setTimeout(() => {
  triggerReveal()
}, 100)

/* ============================================================
   Smooth hover effect on glass cards (tilt)
   ============================================================ */
function initCardTilt() {
  document.querySelectorAll('.card.glass').forEach(card => {
    const el = card as HTMLElement

    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      gsap.to(el, {
        rotateY: x * 6,
        rotateX: -y * 6,
        duration: 0.3,
        ease: 'power1.out',
        transformPerspective: 800,
      })
    })

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    })
  })
}

// Run after DOM ready and on each page change
initCardTilt()

/* ============================================================
   Nav scroll effect
   ============================================================ */
const nav = document.getElementById('nav')!
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.style.background = 'rgba(5, 5, 12, 0.85)'
  } else {
    nav.style.background = 'rgba(5, 5, 12, 0.6)'
  }
}, { passive: true })
