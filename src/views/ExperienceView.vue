<script setup lang="ts">
import type { Component } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { Briefcase, Award, HeartHandshake, Database, Atom, ClipboardList } from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experiencesPageData, type CertificationIcon, type ExperienceSectionIcon } from '../data/experiencesData'

const iconMap: Record<ExperienceSectionIcon, Component> = {
  briefcase: Briefcase,
  award: Award,
  'heart-handshake': HeartHandshake,
}

const certIconMap: Record<CertificationIcon, Component> = {
  database: Database,
  atom: Atom,
  'clipboard-list': ClipboardList,
}

const cards = experiencesPageData.cards
const hero = experiencesPageData.hero

const scrollTrackRef = ref<HTMLElement | null>(null)
const mainTitleRef = ref<HTMLElement | null>(null)
const scrollHintRef = ref<HTMLElement | null>(null)
const miniThumbRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const innerRefs = ref<HTMLElement[]>([])

let timeline: gsap.core.Timeline | null = null
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

const setCardRef = (el: Element | null, index: number) => {
  if (!el) {
    return
  }
  cardRefs.value[index] = el as HTMLElement
}

const setInnerRef = (el: Element | null, index: number) => {
  if (!el) {
    return
  }
  innerRefs.value[index] = el as HTMLElement
}

const resolveSectionIcon = (key: ExperienceSectionIcon) => iconMap[key]
const resolveCertificationIcon = (key: CertificationIcon) => certIconMap[key]

const killAnimation = () => {
  timeline?.kill()
  timeline = null
}

const initAnimation = () => {
  const track = scrollTrackRef.value
  if (!track) {
    return
  }

  killAnimation()

  const localCards = cardRefs.value
  const localInners = innerRefs.value
  const rotations = [0, 0, 0]

  gsap.set(localCards, { y: '120vh', rotation: 0 })
  gsap.set(localInners, { opacity: 1, y: 0 })

  timeline = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: 'top top',
      end: '+=400%',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: ({ progress }) => {
        if (scrollHintRef.value) {
          gsap.set(scrollHintRef.value, { opacity: progress > 0.02 ? 0 : 0.6 })
        }

        if (mainTitleRef.value) {
          gsap.set(mainTitleRef.value, {
            opacity: Math.max(0, 1 - progress * 6),
            scale: 1 + progress,
            y: -progress * 100,
          })
        }

        if (miniThumbRef.value) {
          gsap.set(miniThumbRef.value, { y: progress * 120 })
        }
      },
    },
  })

  localCards.forEach((card, index) => {
    const startTime = index * 2
    timeline?.to(
      card,
      {
        y: 0,
        rotation: rotations[index] ?? 0,
        duration: 4,
        ease: 'power2.out',
      },
      startTime,
    )
    // Le texte reste ancré à la card, pas d'animation séparée
  })
}

const onResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    initAnimation()
    ScrollTrigger.refresh()
  }, 180)
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  initAnimation()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }

  window.removeEventListener('resize', onResize)
  killAnimation()
})
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner">
        <div class="experience-scene">
          <div ref="scrollHintRef" class="scroll-hint">
            <span>Scrollez pour explorer</span>
            <div class="hint-line" />
          </div>

          <!-- mini-scrollbar supprimée -->

          <div ref="scrollTrackRef" class="scroll-track">
            <div class="sticky-wrap">
              <div ref="mainTitleRef" class="main-title">
                <p class="main-kicker">{{ hero.kicker }}</p>
                <h1>
                  {{ hero.title }}
                  <br />
                  <span>{{ hero.highlight }}</span>
                </h1>
              </div>

              <div class="cards-layer">
                <article
                  v-for="(section, cardIndex) in cards"
                  :key="section.id"
                  :ref="(el) => setCardRef(el, cardIndex)"
                  class="dynamic-card glass-panel"
                  :class="[
                    cardIndex === 0 ? 'panel-left' : cardIndex === 1 ? 'panel-center' : 'panel-right',
                  ]"
                >
                  <div class="big-number">{{ section.number }}</div>

                  <div :ref="(el) => setInnerRef(el, cardIndex)" class="dynamic-inner panel-inner">
                    <header class="panel-header">
                      <div class="panel-title-row">
                        <span class="section-icon" :class="section.theme.iconClass">
                          <component :is="resolveSectionIcon(section.icon)" :size="22" />
                        </span>
                        <h2 :class="section.theme.titleClass">{{ section.sectionTitle }}</h2>
                      </div>
                      <div class="panel-divider" />
                    </header>

                    <div class="panel-scroll-body">
                      <template v-if="section.type === 'experience' && section.experience">
                        <div class="card-block block-experience">
                          <div class="exp-header">
                            <div>
                              <h3>{{ section.experience.role }}</h3>
                              <p class="timeline-role">{{ section.experience.company }}</p>
                            </div>
                            <span class="exp-badge">{{ section.experience.badge }}</span>
                          </div>

                          <div class="exp-meta">
                            <span class="exp-date">{{ section.experience.date }}</span>
                            <span class="exp-duration">{{ section.experience.duration }}</span>
                          </div>

                          <ul class="bullet-list">
                            <li v-for="point in section.experience.points" :key="point">{{ point }}</li>
                          </ul>
                        </div>
                      </template>

                      <template v-else-if="section.type === 'certifications' && section.certifications">
                        <div class="stack-grid">
                          <div
                            v-for="cert in section.certifications.items"
                            :key="cert.id"
                            class="card-block cert-row"
                          >
                            <div class="cert-icon-box" :class="cert.boxClass">
                              <component :is="resolveCertificationIcon(cert.icon)" :size="18" :class="cert.iconClass" />
                            </div>

                            <div class="cert-copy">
                              <h4>{{ cert.title }}</h4>
                              <p>{{ cert.subtitle }}</p>
                            </div>

                            <span class="cert-date" :class="cert.iconClass">{{ cert.date }}</span>
                          </div>
                        </div>
                      </template>

                      <template v-else-if="section.type === 'volunteering' && section.volunteering">
                        <div class="stack-grid volunteering-grid">
                          <div v-for="vol in section.volunteering.items" :key="vol.id" class="card-block">
                            <h3>{{ vol.title }}</h3>
                            <p class="timeline-role">{{ vol.role }}</p>
                            <p class="vol-desc">{{ vol.description }}</p>

                            <div class="skill-tags">
                              <span v-for="tag in vol.tags" :key="tag" class="tag">{{ tag }}</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.experience-scene {
  position: relative;
}

.scroll-track {
  position: relative;
  width: 100%;
  height: 400vh;
}

.sticky-wrap {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-title {
  position: absolute;
  z-index: 0;
  text-align: center;
  padding: 0 1rem;
}

.main-kicker {
  color: #facc15;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  margin-bottom: 1rem;
}

.main-title h1 {
  font-size: clamp(2.2rem, 7.8vw, 5.4rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.05em;
  color: #ffffff;
}

.main-title h1 span {
  color: transparent;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.3) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Répartition en tiers */
.cards-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
  height: 100%;
}

.glass-panel {
  background: linear-gradient(145deg, rgba(15, 20, 30, 0.95) 0%, rgba(5, 10, 15, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 32px;
}

/* Placement flex pour chaque card */
.dynamic-card {
  position: relative;
  margin-top: 12vh;
  margin-bottom: 0;
  width: 100%;
  max-width: 520px;
  height: 80vh;
  pointer-events: auto;
  overflow: hidden;
  flex: 1 1 33.33%;
  display: flex;
  flex-direction: column;
}

.panel-inner {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.45rem;
}

.big-number {
  position: absolute;
  top: -20px;
  right: -10px;
  font-size: 200px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.02);
  line-height: 1;
  pointer-events: none;
}

.panel-header {
  margin-bottom: 1.45rem;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.65rem;
}

.panel-title-row h2 {
  font-size: clamp(1.55rem, 3.1vw, 2.05rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}

.panel-divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
}

.panel-scroll-body {
  position: relative;
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.35rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(250, 204, 21, 0.35) transparent;
}

.panel-scroll-body::-webkit-scrollbar {
  width: 4px;
  display: block;
}

.panel-scroll-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-scroll-body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.3);
}

.card-block {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.2rem;
}

.stack-grid {
  display: grid;
  gap: 0.95rem;
}

.exp-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.exp-header h3,
.card-block h3,
.cert-copy h4 {
  margin: 0;
  color: #ffffff;
  font-size: 1.08rem;
  font-weight: 700;
}

.timeline-role {
  margin: 0.2rem 0 0;
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.84rem;
  font-weight: 500;
}

.exp-badge {
  height: fit-content;
  background: #0f172a;
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.25);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.7rem;
}

.exp-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1rem;
}

.exp-date {
  color: #fde68a;
  font-size: 0.72rem;
  border-radius: 0.45rem;
  border: 1px solid rgba(250, 204, 21, 0.35);
  background: rgba(63, 48, 6, 0.82);
  padding: 0.2rem 0.45rem;
}

.exp-duration {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  font-weight: 500;
}

.bullet-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.bullet-list li {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.88rem;
  line-height: 1.4;
  padding-left: 1.1rem;
  position: relative;
}

.bullet-list li::before {
  content: '—';
  color: rgba(250, 204, 21, 0.6);
  position: absolute;
  left: 0;
  top: 0;
}

.cert-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.cert-icon-box {
  width: 2.8rem;
  height: 2.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.cert-copy {
  flex-grow: 1;
}

.cert-copy p {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.cert-date {
  font-size: 0.75rem;
  font-weight: 600;
}

.volunteering-grid {
  gap: 1.15rem;
}

.vol-desc {
  margin: 0.8rem 0 1rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.88rem;
  line-height: 1.5;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tag {
  background: rgba(16, 24, 39, 0.88);
  border: 1px solid rgba(250, 204, 21, 0.28);
  color: #f8fafc;
  font-size: 0.62rem;
  text-transform: uppercase;
  font-weight: 700;
  border-radius: 0.35rem;
  padding: 0.18rem 0.42rem;
}

.scroll-hint {
  position: fixed;
  left: 50%;
  bottom: 2.4rem;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  opacity: 0.6;
  z-index: 100;
  pointer-events: none;
}

.scroll-hint span {
  color: #facc15;
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.28em;
}

.hint-line {
  width: 1px;
  height: 3rem;
  background: linear-gradient(180deg, #facc15 0%, transparent 100%);
}

/* mini-scrollbar supprimée */

.theme-experience-title {
  color: #fff !important;
  background: none !important;
}

.theme-experience-icon {
  color: #ffd600 !important;
}

.theme-certifications-title {
  color: #fff !important;
  background: none !important;
}

.theme-certifications-icon {
  color: #ffd600 !important;
}

.theme-volunteering-title {
  color: #fff !important;
  background: none !important;
}

.theme-volunteering-icon {
  color: #ffd600 !important;
}

.cert-box-purple {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.28);
}

.cert-box-blue {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.28);
}

.cert-box-orange {
  background: rgba(251, 146, 60, 0.1);
  border-color: rgba(251, 146, 60, 0.28);
}

.cert-icon-purple {
  color: #c084fc;
}

.cert-icon-blue {
  color: #60a5fa;
}

.cert-icon-orange {
  color: #fb923c;
}

@media (min-width: 768px) {
  .cards-layer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    width: 100%;
    height: 100%;
  }
  .dynamic-card {
    width: 30%;
    max-width: none;
    margin-left: 1.5%;
    margin-right: 1.5%;
    left: auto;
    transform: none;
  }
}

@media (max-width: 767px) {
  .mini-scrollbar {
    display: none;
  }
}
</style>