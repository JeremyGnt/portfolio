<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

import {
  GraduationCap,
  Settings,
  Lightbulb,
  Target,
  Music,
  Medal,
  Snowflake,
  CircleDot,
  Plane,
} from 'lucide-vue-next'

const SKILLS = [
  'C', 'C++', 'Python', 'Java', 'PHP', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
  'Vue.js', 'Tailwind CSS', 'Vite', 'Three.js', 'GSAP', 'Bootstrap',
  'SQL', 'MySQL', 'Supabase',
  'Git', 'GitHub', 'Vercel', 'VS Code', 'IntelliJ', 'CLion', 'Arduino',
]

const skillContainer = ref<HTMLElement | null>(null)
const skillTagEls = ref<HTMLElement[]>([])
const REPULSION_RADIUS = 120 // px — how far the effect reaches
const REPULSION_STRENGTH = 18 // px — max displacement
const REPULSION_RADIUS_SQ = REPULSION_RADIUS * REPULSION_RADIUS

type TagMotion = {
  el: HTMLElement
  centerX: number
  centerY: number
  xTo: (value: number) => void
  yTo: (value: number) => void
}

let tagMotions: TagMotion[] = []
let pendingMouseX = 0
let pendingMouseY = 0
let pointerFrame: number | null = null
let metricsFrame: number | null = null
let revealTimeout: number | null = null
let handleResize: (() => void) | null = null
let resizeTimer: number | null = null
let stTimeline: gsap.core.Timeline | null = null

const calculateAndSetLogoAnimations = () => {
  const logoJ = document.getElementById('logo-j')
  const logoG = document.getElementById('logo-g')
  const targetJ = document.getElementById('target-j')
  const targetG = document.getElementById('target-g')
  const fadeTexts = document.querySelectorAll('.fade-text')
  const logoBg = document.getElementById('header-logo-bg')
  
  if (!logoJ || !logoG || !targetJ || !targetG || !logoBg) return

  gsap.set([logoJ, logoG, fadeTexts, logoBg], { clearProps: 'all' })
  if (stTimeline) {
    stTimeline.kill()
    stTimeline = null
  }
  
  ScrollTrigger.refresh()

  const rectJ = logoJ.getBoundingClientRect()
  const rectG = logoG.getBoundingClientRect()
  const rectTargetJ = targetJ.getBoundingClientRect()
  const rectTargetG = targetG.getBoundingClientRect()

  const getDeltas = (elRect: DOMRect, targetRect: DOMRect) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop
    const scrollX = window.scrollX || document.documentElement.scrollLeft

    // Absolute screen-space center of the target (where it would be at scrollY = 0)
    const absoluteTargetCenterX = targetRect.left + scrollX + targetRect.width / 2
    const absoluteTargetCenterY = targetRect.top + scrollY + targetRect.height / 2
    
    // Fixed element center (constant relative to viewport)
    const fixedElCenterX = elRect.left + elRect.width / 2
    const fixedElCenterY = elRect.top + elRect.height / 2
    
    const deltaX = absoluteTargetCenterX - fixedElCenterX
    const deltaY = absoluteTargetCenterY - fixedElCenterY
    
    const scaleY = targetRect.height / elRect.height
    // We adjust the visual scale to make the 3D typography match the font size.
    const scale = scaleY * 1.5
    
    return { deltaX, deltaY, scale }
  }

  const dJ = getDeltas(rectJ, rectTargetJ)
  const dG = getDeltas(rectG, rectTargetG)

  gsap.set(logoJ, { x: dJ.deltaX, y: dJ.deltaY, scale: dJ.scale, transformOrigin: '50% 50%' })
  gsap.set(logoG, { x: dG.deltaX, y: dG.deltaY, scale: dG.scale, transformOrigin: '50% 50%' })
  gsap.set(logoBg, { opacity: 0 })

  stTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      // We multiply the scroll distance required by 2.5 to stretch the animation
      // over a much longer scroll, making the letters' movement smooth and gradual
      end: () => '+=' + (dJ.deltaY * 2.5),
      scrub: true,
    }
  })

  stTimeline.to(logoJ, { x: 0, y: 0, scale: 1, ease: 'none' }, 0)
  stTimeline.to(logoG, { x: 0, y: 0, scale: 1, ease: 'none' }, 0)
  stTimeline.to(logoBg, { opacity: 1, ease: 'power2.inOut' }, 0)
  stTimeline.to(fadeTexts, { opacity: 0, y: -40, stagger: 0.1, ease: 'power1.out' }, 0)
}

const onResizeGSAP = () => {
  if (resizeTimer) globalThis.clearTimeout(resizeTimer)
  resizeTimer = globalThis.setTimeout(() => {
    calculateAndSetLogoAnimations()
  }, 150)
}

function setSkillTagRef(el: Element | null, index: number) {
  if (el instanceof HTMLElement) {
    skillTagEls.value[index] = el
  }
}

function cacheSkillTagMetrics() {
  tagMotions = skillTagEls.value
    .filter((tag): tag is HTMLElement => Boolean(tag))
    .map((tag) => ({
      el: tag,
      centerX: tag.offsetLeft + tag.offsetWidth / 2,
      centerY: tag.offsetTop + tag.offsetHeight / 2,
      xTo: gsap.quickTo(tag, 'x', { duration: 0.2, ease: 'power2.out', overwrite: true }),
      yTo: gsap.quickTo(tag, 'y', { duration: 0.2, ease: 'power2.out', overwrite: true }),
    }))
}

function scheduleSkillMetricsRefresh() {
  if (metricsFrame !== null) return

  metricsFrame = requestAnimationFrame(() => {
    cacheSkillTagMetrics()
    metricsFrame = null
  })
}

function applySkillRepulsion() {
  pointerFrame = null

  for (const tagMotion of tagMotions) {
    const dx = tagMotion.centerX - pendingMouseX
    const dy = tagMotion.centerY - pendingMouseY
    const distanceSq = dx * dx + dy * dy

    if (distanceSq < REPULSION_RADIUS_SQ) {
      const distance = Math.sqrt(distanceSq)
      const force = (1 - distance / REPULSION_RADIUS) * REPULSION_STRENGTH
      const angle = Math.atan2(dy, dx)

      tagMotion.xTo(Math.cos(angle) * force)
      tagMotion.yTo(Math.sin(angle) * force)
      continue
    }

    tagMotion.xTo(0)
    tagMotion.yTo(0)
  }
}

function handleSkillMouseMove(e: MouseEvent) {
  if (!skillContainer.value) return

  const containerRect = skillContainer.value.getBoundingClientRect()

  pendingMouseX = e.clientX - containerRect.left
  pendingMouseY = e.clientY - containerRect.top

  if (pointerFrame === null) {
    pointerFrame = requestAnimationFrame(applySkillRepulsion)
  }
}

function handleSkillMouseLeave() {
  if (pointerFrame !== null) {
    cancelAnimationFrame(pointerFrame)
    pointerFrame = null
  }

  tagMotions.forEach(({ el }) => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  })
}

function triggerReveal() {
  const revealEls = document.querySelectorAll('.reveal')
  revealEls.forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 24 })
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      delay: i * 0.08,
      ease: 'power2.out',
    })
  })
}

onMounted(() => {
  revealTimeout = globalThis.setTimeout(triggerReveal, 100)
  handleResize = () => {
    scheduleSkillMetricsRefresh()
    onResizeGSAP()
  }

  nextTick(() => {
    cacheSkillTagMetrics()
    window.addEventListener('resize', handleResize)
    
    setTimeout(() => {
      calculateAndSetLogoAnimations()
    }, 250)
  })
})

onUnmounted(() => {
  if (pointerFrame !== null) {
    cancelAnimationFrame(pointerFrame)
  }

  if (metricsFrame !== null) {
    cancelAnimationFrame(metricsFrame)
  }

  if (revealTimeout !== null) {
    globalThis.clearTimeout(revealTimeout)
  }

  if (handleResize) {
    window.removeEventListener('resize', handleResize)
  }
  
  if (resizeTimer) {
    globalThis.clearTimeout(resizeTimer)
  }
  if (stTimeline) {
    stTimeline.kill()
    stTimeline = null
  }
  const logoJ = document.getElementById('logo-j')
  const logoG = document.getElementById('logo-g')
  const logoBg = document.getElementById('header-logo-bg')
  if (logoJ && logoG && logoBg) {
    gsap.set([logoJ, logoG, logoBg], { clearProps: 'all' })
  }
})
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner">
        <div id="hero-section" class="home-hero">
          <p class="hero-kicker-top fade-text gradient-text">ÉTUDIANT INGÉNIEUR &bull; DATA &amp; IA</p>
          <h1 class="home-hero-title">
            <span class="home-hero-word">
              <span id="target-j" class="target-letter">J</span><span class="fade-text">érémy</span>
            </span>
            <span class="home-hero-word">
              <span id="target-g" class="target-letter">G</span><span class="fade-text">onnet</span>
            </span>
          </h1>
          <p class="hero-subtitle-bottom fade-text">20 ans &bull; ECE Paris &bull; 3ème année</p>
          
          <div class="hero-scroll-indicator fade-text">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
          </div>
        </div>

        <div class="bento-grid">
          <!-- Left Column — span 7 -->
          <div class="bento-span-7 bento-stack">
            <!-- Compétences techniques -->
            <div class="reveal">
              <div class="card glass skill-card">
                <h2 class="section-title" style="margin-bottom: 1rem;">
                  <span class="section-icon"><Settings :size="20" /></span> Compétences techniques
                </h2>
                <div
                  ref="skillContainer"
                  class="skill-tags"
                  style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; padding: 0.5rem 0;"
                  @mouseenter="scheduleSkillMetricsRefresh"
                  @mousemove="handleSkillMouseMove"
                  @mouseleave="handleSkillMouseLeave"
                >
                  <span
                    v-for="(skill, index) in SKILLS"
                    :key="skill"
                    :ref="(el) => setSkillTagRef(el, index)"
                    class="tag"
                  >{{ skill }}</span>
                </div>
              </div>
            </div>

            <!-- Soft Skills -->
            <div class="reveal">
              <div class="card glass">
                <h2 class="section-title">
                  <span class="section-icon"><Lightbulb :size="20" /></span> Soft Skills
                </h2>
                <ul class="bullet-list">
                  <li>Esprit d'équipe &amp; communication</li>
                  <li>Travail en autonomie</li>
                  <li>Gestion de projet</li>
                  <li>Curiosité intellectuelle</li>
                  <li>Esprit analytique</li>
                  <li>Organisation &amp; gestion du temps</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Right Column — span 5 -->
          <div class="bento-span-5 bento-stack">
            <!-- Éducation -->
            <div class="reveal">
              <div class="card glass">
                <h2 class="section-title" style="margin-bottom: 1.5rem;">
                  <span class="section-icon"><GraduationCap :size="20" /></span> Éducation
                </h2>
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <h3>ECE Paris</h3>
                      <p class="timeline-role">École d'ingénieur — Majeure Data &amp; Intelligence Artificielle</p>
                      <p class="timeline-date">2023 — 2028</p>
                    </div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <h3>Ajou University — Corée du Sud</h3>
                      <p class="timeline-role">Programme d'échange international</p>
                      <p class="timeline-date">Août 2025 — Décembre 2025</p>
                    </div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <h3>Lycée Pierre Termier</h3>
                      <p class="timeline-role">Baccalauréat scientifique — Mention Bien</p>
                      <p class="timeline-date">2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Centres d'intérêt -->
            <div class="reveal">
              <div class="card glass">
                <h2 class="section-title">
                  <span class="section-icon"><Target :size="20" /></span> Centres d'intérêt
                </h2>
                <div class="interest-tags" style="justify-content: center;">
                  <span class="interest-tag"><Music :size="16" /> Piano</span>
                  <span class="interest-tag"><Medal :size="16" /> Badminton</span>
                  <span class="interest-tag"><Snowflake :size="16" /> Ski</span>
                  <span class="interest-tag"><CircleDot :size="16" /> Tennis</span>
                  <span class="interest-tag"><Plane :size="16" /> Voyage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-hero {
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rem 0 3rem;
  z-index: 2;
  position: relative;
}

.home-hero-title {
  font-size: clamp(3.5rem, 10vw, 7.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #ffffff;
  display: flex;
  gap: 3rem;
  margin: 1.5rem 0;
}

.home-hero-word {
  display: flex;
  align-items: center;
}

.target-letter {
  opacity: 0;
  display: inline-block;
  line-height: 1;
  transform-origin: center center;
  margin-right: 0.16em;
}

.fade-text {
  display: inline-block;
  will-change: transform, opacity;
}

.hero-kicker-top {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0;
}

.hero-subtitle-bottom {
  font-size: 1.25rem;
  color: #a0a0a0;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.hero-scroll-indicator {
  margin-top: 3rem;
  color: #666;
  animation: bounce 2s infinite ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

@media (max-width: 640px) {
  .home-hero-title {
    flex-direction: column;
    gap: 0;
    font-size: 4rem;
  }
}
</style>
