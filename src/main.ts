import './style.css'
import { gsap } from 'gsap'

// ─── Year ───────────────────────────────────────────────────
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear().toString()

// ─── Navigation ─────────────────────────────────────────────
type PageId = 'about' | 'experience' | 'projects' | 'contact'

const pages = document.querySelectorAll<HTMLElement>('.page')
const navBtns = document.querySelectorAll<HTMLButtonElement>('.nav-btn')

function showPage(id: PageId): void {
  pages.forEach(p => {
    p.classList.remove('active')
  })
  navBtns.forEach(b => {
    b.classList.toggle('active', b.dataset['page'] === id)
  })

  const target = document.getElementById(`page-${id}`)
  if (target) {
    target.classList.add('active')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    triggerReveal(target)
  }

  // Close mobile menu
  const mobileMenu = document.getElementById('mobileMenu')
  if (mobileMenu) mobileMenu.classList.remove('open')
}

// Wire all nav buttons (desktop + mobile)
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset['page'] as PageId
    if (id) showPage(id)
  })
})

// Wire hero CTA buttons
document.querySelectorAll<HTMLButtonElement>('.btn-primary[data-page], .btn-secondary[data-page]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset['page'] as PageId
    if (id) showPage(id)
  })
})

// ─── Mobile menu toggle ──────────────────────────────────────
const menuToggle = document.getElementById('menuToggle')
const mobileMenu = document.getElementById('mobileMenu')

menuToggle?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open')
})

// ─── Scroll reveal ───────────────────────────────────────────
function triggerReveal(container: Element): void {
  const items = container.querySelectorAll<HTMLElement>('.reveal')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )

  items.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.06}s`
    observer.observe(el)
  })
}

// Initial reveal for first page
const aboutPage = document.getElementById('page-about')
if (aboutPage) triggerReveal(aboutPage)

// ─── Hero entrance animation ─────────────────────────────────
const heroEl = document.querySelector<HTMLElement>('.hero')
if (heroEl) {
  const children = Array.from(heroEl.children) as HTMLElement[]
  gsap.from(children, {
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
    delay: 0.1,
  })
}

// ─── Nav scroll effect ───────────────────────────────────────
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  if (nav) {
    nav.style.background = window.scrollY > 20
      ? 'rgba(7, 7, 16, 0.90)'
      : 'rgba(7, 7, 16, 0.70)'
  }
}, { passive: true })
