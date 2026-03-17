<script setup lang="ts">
import { onBeforeUpdate, onMounted, onUnmounted, ref, type Component } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, Github, Linkedin, Mail, Phone } from 'lucide-vue-next'

gsap.registerPlugin(ScrollTrigger)

interface ContactItem {
  id: string
  href: string
  icon: Component
  label: string
  value: string
  target?: string
}

const contacts: ContactItem[] = [
  {
    id: 'email',
    href: 'mailto:jeremy.gonnet31@gmail.com',
    icon: Mail,
    label: 'Email',
    value: 'jeremy.gonnet31@gmail.com',
  },
  {
    id: 'linkedin',
    href: 'https://linkedin.com/in/jeremygonnet',
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/jeremygonnet',
    target: '_blank',
  },
  {
    id: 'github',
    href: 'https://github.com/JeremyGnt',
    icon: Github,
    label: 'GitHub',
    value: 'github.com/JeremyGnt',
    target: '_blank',
  },
  {
    id: 'phone',
    href: 'tel:+33782846856',
    icon: Phone,
    label: 'Telephone',
    value: '+33 7 82 84 68 56',
  },
]

const sectionRef = ref<HTMLElement | null>(null)
const cardsViewportRef = ref<HTMLElement | null>(null)
const cardsTrackRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])

let animationContext: gsap.Context | null = null
let mediaQueries: gsap.MatchMedia | null = null

function setCardRef(element: Element | null, index: number) {
  if (!element) {
    return
  }

  cardRefs.value[index] = element as HTMLElement
}

function resetCardRefs() {
  cardRefs.value = []
}

function getTrackMetrics() {
  const viewport = cardsViewportRef.value
  const track = cardsTrackRef.value

  if (!viewport || !track) {
    return {
      startX: 0,
      overflow: 0,
      distance: 0,
    }
  }

  const startX = Math.min(viewport.clientWidth * 0.18, 180)
  const overflow = Math.max(track.scrollWidth - viewport.clientWidth, 0)

  return {
    startX,
    overflow,
    distance: startX + overflow,
  }
}

onBeforeUpdate(resetCardRefs)

onMounted(() => {
  animationContext = gsap.context(() => {
    const introElements = gsap.utils.toArray<HTMLElement>('[data-contact-intro]')

    if (introElements.length > 0) {
      gsap.from(introElements, {
        autoAlpha: 0,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
      })
    }

    mediaQueries = gsap.matchMedia()

    mediaQueries.add('(min-width: 981px) and (prefers-reduced-motion: no-preference)', () => {
      const section = sectionRef.value
      const track = cardsTrackRef.value
      const cards = cardRefs.value.filter(Boolean)

      if (!section || !track || cards.length === 0) {
        return
      }

      gsap.set(track, {
        x: () => getTrackMetrics().startX,
        force3D: true,
        willChange: 'transform',
      })

      gsap.set(cards, {
        autoAlpha: 0.45,
        willChange: 'opacity',
      })

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => {
            const { distance } = getTrackMetrics()
            return `+=${Math.max(distance * 1.2, window.innerHeight * 1.7)}`
          },
          scrub: 0.9,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      })

      timeline.to(
        track,
        {
          x: () => -getTrackMetrics().overflow,
        },
        0,
      )

      timeline.to(
        cards,
        {
          autoAlpha: 1,
          duration: 0.28,
          stagger: 0.05,
          ease: 'power2.out',
        },
        0.02,
      )
    })

    mediaQueries.add('(max-width: 980px), (prefers-reduced-motion: reduce)', () => {
      const section = sectionRef.value
      const cards = cardRefs.value.filter(Boolean)

      if (!section || cards.length === 0) {
        return
      }

      gsap.from(cards, {
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true,
        },
      })
    })
  }, sectionRef)
})

onUnmounted(() => {
  mediaQueries?.revert()
  mediaQueries = null
  animationContext?.revert()
  animationContext = null
})
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner contact-page">
        <section ref="sectionRef" class="contact-horizontal-section">
          <div class="contact-shell">
            <div class="contact-intro">
              <p class="contact-kicker" data-contact-intro>Contact</p>
              <h1 class="contact-title" data-contact-intro>
                Restons en
                <span class="gradient-text">contact</span><span class="hero-dot">.</span>
              </h1>
              <p class="contact-meta" data-contact-intro>Mail · LinkedIn · GitHub · Tel</p>
            </div>

            <div class="contact-rail">
              <div ref="cardsViewportRef" class="contact-cards-viewport">
                <div ref="cardsTrackRef" class="contact-cards-track">
                  <a
                    v-for="(contact, index) in contacts"
                    :key="contact.id"
                    :ref="(element) => setCardRef(element, index)"
                    :href="contact.href"
                    :target="contact.target"
                    :rel="contact.target ? 'noopener noreferrer' : undefined"
                    class="card glass contact-card"
                    :aria-label="`${contact.label} : ${contact.value}`"
                  >
                    <div class="contact-card-head">
                      <span class="contact-card-index">{{ String(index + 1).padStart(2, '0') }}</span>
                      <component :is="contact.icon" :size="20" />
                    </div>

                    <div class="contact-card-body">
                      <p class="contact-card-label">{{ contact.label }}</p>
                      <h2>{{ contact.value }}</h2>
                    </div>

                    <span class="contact-card-link">
                      Ouvrir
                      <ArrowUpRight :size="16" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding-top: 0;
}

.contact-page {
  padding-top: 0;
  padding-bottom: 0;
}

.contact-horizontal-section {
  width: 100%;
  min-height: 100dvh;
}

.contact-shell {
  width: 100%;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(16rem, 24rem) minmax(0, 1fr);
  align-items: center;
  gap: clamp(1.5rem, 4vw, 4rem);
  padding: clamp(6.75rem, 11vh, 8rem) 0 clamp(4.25rem, 8vh, 5.5rem);
  box-sizing: border-box;
}

.contact-intro {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.contact-kicker,
.contact-meta,
.contact-card-index,
.contact-card-label,
.contact-card-link {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.contact-kicker {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.52);
}

.contact-title {
  margin: 0;
  font-size: clamp(3.3rem, 6vw, 5.9rem);
  line-height: 0.96;
  letter-spacing: -0.08em;
}

.contact-meta {
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.34);
}

.contact-rail {
  min-width: 0;
}

.contact-cards-viewport {
  width: 100%;
  overflow: hidden;
  background: transparent;
  mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
}

.contact-cards-track {
  display: flex;
  gap: 1rem;
  width: max-content;
  padding: 1rem 0;
  background: transparent;
}

.contact-card {
  position: relative;
  contain: none;
  width: clamp(17rem, 24vw, 21rem);
  min-height: 15rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.4rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.92);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.018) 100%),
    #111318;
  border-color: rgba(255, 255, 255, 0.07);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.075),
    inset 0 -1px 0 rgba(255, 255, 255, 0.018),
    0 16px 28px rgba(0, 0, 0, 0.24);
  transform: scale(1) translateZ(0);
  transform-origin: center center;
  will-change: transform;
  transition: transform 0.46s cubic-bezier(0.22, 1, 0.36, 1);
}

.contact-card.glass:hover {
  z-index: 2;
  transform: scale(1.024) translateZ(0);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.018) 100%),
    #111318;
  border-color: rgba(255, 255, 255, 0.07);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.075),
    inset 0 -1px 0 rgba(255, 255, 255, 0.018),
    0 16px 28px rgba(0, 0, 0, 0.24);
}

.contact-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.58);
}

.contact-card-index {
  font-size: 0.68rem;
}

.contact-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.contact-card-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.42);
}

.contact-card-body h2 {
  margin: 0;
  font-size: clamp(1.25rem, 1.8vw, 1.7rem);
  line-height: 1.15;
  letter-spacing: -0.05em;
  word-break: break-word;
}

.contact-card-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 980px) {
  .contact-horizontal-section {
    min-height: auto;
  }

  .contact-shell {
    min-height: auto;
    grid-template-columns: 1fr;
    align-items: start;
    gap: 1.75rem;
    padding: 5.25rem 0 0;
  }

  .contact-cards-viewport {
    overflow: visible;
    mask-image: none;
    -webkit-mask-image: none;
  }

  .contact-cards-track {
    width: 100%;
    flex-direction: column;
    padding: 0;
  }

  .contact-card {
    width: 100%;
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .contact-title {
    font-size: clamp(2.8rem, 12vw, 4.2rem);
  }

  .contact-meta {
    font-size: 0.68rem;
    line-height: 1.6;
  }

  .contact-card {
    padding: 1.2rem;
  }
}
</style>
