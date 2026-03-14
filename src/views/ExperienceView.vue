<script setup lang="ts">
import type { Component } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Briefcase, Award, HeartHandshake } from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRevealAnimation } from '../composables/useRevealAnimation'
import { experiencesPageData } from '../data/experiencesData'

type IconKey = 'briefcase' | 'award' | 'heart-handshake'

const iconMap: Record<IconKey, Component> = {
  briefcase: Briefcase,
  award: Award,
  'heart-handshake': HeartHandshake,
}

const pageData = experiencesPageData
const cards = computed(() => pageData.cards)

const stackRootRef = ref<HTMLElement | null>(null)
const stackCardRefs = ref<HTMLElement[]>([])
const stackInnerRefs = ref<HTMLElement[]>([])
const finalCardRotations = [-4, -1, 4]
const cardStartOffsets = [0, 96, 192]

let stackTrigger: ScrollTrigger | null = null

const setStackCardRef = (el: Element | null, index: number) => {
  if (!el) {
    return
  }
  stackCardRefs.value[index] = el as HTMLElement
}

const setStackInnerRef = (el: Element | null, index: number) => {
  if (!el) {
    return
  }
  stackInnerRefs.value[index] = el as HTMLElement
}

const resolveSectionIcon = (key: IconKey) => iconMap[key]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const refreshStackFrame = (progress: number) => {
  const sharedReveal = clamp(progress, 0, 1)
  const liftReveal = clamp(sharedReveal / 0.72, 0, 1)
  const easedLiftReveal = gsap.parseEase('power3.out')(liftReveal)
  const easedSharedReveal = gsap.parseEase('power3.out')(sharedReveal)

  cards.value.forEach((_, index) => {
    const card = stackCardRefs.value[index]
    const inner = stackInnerRefs.value[index]
    if (!card || !inner) {
      return
    }

    const y = (1 - easedLiftReveal) * (cardStartOffsets[index] ?? cardStartOffsets[cardStartOffsets.length - 1])
    const rotation = (finalCardRotations[index] ?? 0) * easedSharedReveal

    gsap.set(card, {
      y,
      rotation,
      transformOrigin: '50% 100%',
      zIndex: index + 1,
    })

    gsap.set(inner, {
      opacity: 1,
      y: 0,
    })
  })
}

useRevealAnimation(100, '.reveal')

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  refreshStackFrame(0)

  if (!stackRootRef.value) {
    return
  }

  stackTrigger = ScrollTrigger.create({
    trigger: stackRootRef.value,
    start: 'top top+=110',
    end: '+=300%',
    scrub: 1,
    pin: true,
    onUpdate: ({ progress }) => {
      refreshStackFrame(progress)
    },
  })
})

onUnmounted(() => {
  if (stackTrigger) {
    stackTrigger.kill()
    stackTrigger = null
  }
})
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner">
        <!-- Hero text removed as requested -->

        <div ref="stackRootRef" class="relative min-h-[92vh] pt-[19vh] md:pt-[21vh]">
          <article
            v-for="(section, cardIndex) in cards"
            :key="section.id"
            :ref="(el) => setStackCardRef(el, cardIndex)"
            class="absolute top-0 left-1/2 -translate-x-1/2 glass-panel experience-panel"
            :class="[
              section.theme.cardClass,
              cardIndex === 0
                ? 'panel-left'
                : cardIndex === 1
                  ? 'panel-center'
                  : 'panel-right',
            ]"
          >
            <div class="big-number">{{ cardIndex + 1 }}</div>
            <div
              :ref="(el) => setStackInnerRef(el, cardIndex)"
              class="relative z-10 h-full flex flex-col p-6 md:p-7"
            >
              <header class="relative z-10 mb-6">
                <div class="flex items-center gap-3 mb-4">
                  <span class="section-icon" :class="section.theme.iconClass">
                    <component :is="resolveSectionIcon(section.icon)" :size="22" />
                  </span>
                  <h2 class="text-3xl font-black" :class="section.theme.titleClass">
                    {{ section.sectionTitle }}
                  </h2>
                </div>
                <div class="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
              </header>

              <div class="relative z-10 flex-grow overflow-y-auto pr-2 panel-scroll-body">
                <template v-if="section.type === 'experience' && section.experience">
                  <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative">
                    <div class="exp-header">
                      <div>
                        <h3>{{ section.experience.role }}</h3>
                        <p class="timeline-role">{{ section.experience.subtitle }}</p>
                      </div>
                      <span class="exp-badge">{{ section.experience.badge }}</span>
                    </div>
                    <ul class="bullet-list">
                      <li v-for="point in section.experience.points" :key="point">{{ point }}</li>
                    </ul>
                  </div>
                </template>

                <template v-else-if="section.type === 'certifications' && section.certifications">
                  <div class="space-y-4">
                    <div
                      v-for="cert in section.certifications.items"
                      :key="cert.id"
                      class="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative flex items-center gap-4"
                    >
                      <div class="cert-icon cert-icon-box">{{ cert.icon }}</div>
                      <div>
                        <h3>{{ cert.title }}</h3>
                        <p class="timeline-role">{{ cert.subtitle }}</p>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else-if="section.type === 'volunteering' && section.volunteering">
                  <div class="space-y-4">
                    <div
                      v-for="vol in section.volunteering.items"
                      :key="vol.id"
                      class="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative"
                    >
                      <h3>{{ vol.title }}</h3>
                      <p class="timeline-role">{{ vol.subtitle }}</p>
                      <p class="vol-desc">{{ vol.description }}</p>
                      <div class="skill-tags mt-sm">
                        <span v-for="tag in vol.tags" :key="tag" class="tag">{{ tag }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </article>
        </div>

        <div class="h-[95vh] md:h-[88vh] pointer-events-none invisible" aria-hidden="true">
          <div class="section-block">
            <div class="card glass exp-card" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.glass-panel {
  background: linear-gradient(145deg, rgba(15, 20, 30, 0.95) 0%, rgba(5, 10, 15, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.experience-panel {
  width: min(82vw, 420px);
  height: 84vh;
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
  z-index: 0;
}

.theme-experience-title {
  color: #facc15;
}

.theme-experience-icon {
  color: #facc15;
}

.theme-certifications-title {
  background: linear-gradient(90deg, #c084fc 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.theme-certifications-icon {
  color: #a78bfa;
}

.theme-volunteering-title {
  background: linear-gradient(90deg, #34d399 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.theme-volunteering-icon {
  color: #2dd4bf;
}

.cert-icon-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 0.95rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  background: linear-gradient(160deg, rgba(120, 86, 255, 0.6) 0%, rgba(45, 107, 255, 0.45) 100%);
  border: 1px solid rgba(192, 210, 255, 0.32);
  flex-shrink: 0;
}

.panel-scroll-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.28) transparent;
}

.panel-scroll-body::-webkit-scrollbar {
  width: 6px;
}

.panel-scroll-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-scroll-body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}

@media (min-width: 640px) {
  .experience-panel {
    width: 70vw;
  }
}

@media (min-width: 768px) {
  .experience-panel {
    width: 30vw;
    max-width: none;
  }

  .panel-left {
    left: 2.5vw;
    transform: translateX(0);
  }

  .panel-center {
    left: 35vw;
    transform: translateX(0);
  }

  .panel-right {
    left: 67.5vw;
    transform: translateX(0);
  }
}

</style>
