import { onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollWindowToTopInstantly } from '../utils/scroll'

gsap.registerPlugin(ScrollTrigger)

const logoSpinTriggerThreshold = 0.82
const logoSpinResetThreshold = 0.68

export function useExperienceSceneAnimation() {
  const scrollTrackRef = ref<HTMLElement | null>(null)
  const mainTitleRef = ref<HTMLElement | null>(null)
  const scrollHintRef = ref<HTMLElement | null>(null)
  const cardRefs = ref<HTMLElement[]>([])

  let context: gsap.Context | null = null
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null
  let isHeaderCompacted = false
  let isLogoSpinReady = false

  const dispatchLogoSpinCue = (ready: boolean) => {
    window.dispatchEvent(new CustomEvent('experience-logo-spin-cue', { detail: { ready } }))
  }

  const setCardRef = (element: Element | null, index: number) => {
    if (!element) {
      return
    }

    cardRefs.value[index] = element as HTMLElement
  }

  const resetCardRefs = () => {
    cardRefs.value = []
  }

  const destroyScene = () => {
    context?.revert()
    context = null

    const header = document.querySelector<HTMLElement>('.app-header')
    if (header) {
      header.classList.remove('app-header--menu-compact')
    }

    isHeaderCompacted = false
    isLogoSpinReady = false
    window.dispatchEvent(new CustomEvent('experience-menu-compact-change', { detail: { compact: false } }))
    dispatchLogoSpinCue(false)
  }

  const buildScene = () => {
    const track = scrollTrackRef.value
    const cards = cardRefs.value.filter(Boolean)
    const header = document.querySelector<HTMLElement>('.app-header')

    destroyScene()

    if (!track || cards.length === 0) {
      return
    }

    context = gsap.context(() => {
      gsap.set(cards, {
        yPercent: 140,
        autoAlpha: 1,
        willChange: 'transform',
      })

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: `+=${Math.max(cards.length * 90, 250)}%`,
          scrub: 0.9,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onUpdate: ({ progress }) => {
            if (scrollHintRef.value) {
              gsap.to(scrollHintRef.value, {
                autoAlpha: progress > 0.03 ? 0 : 0.72,
                duration: 0.18,
                overwrite: true,
              })
            }

            if (header) {
              const shouldCompactHeader = progress > 0.02 && progress < 0.985

              if (shouldCompactHeader !== isHeaderCompacted) {
                isHeaderCompacted = shouldCompactHeader
                header.classList.toggle('app-header--menu-compact', shouldCompactHeader)
                window.dispatchEvent(
                  new CustomEvent('experience-menu-compact-change', {
                    detail: { compact: shouldCompactHeader },
                  }),
                )
              }
            }

            if (!isLogoSpinReady && progress >= logoSpinTriggerThreshold) {
              isLogoSpinReady = true
              dispatchLogoSpinCue(true)
            } else if (isLogoSpinReady && progress <= logoSpinResetThreshold) {
              isLogoSpinReady = false
              dispatchLogoSpinCue(false)
            }
          },
        },
      })

      cards.forEach((card, index) => {
        timeline.to(
          card,
          {
            yPercent: 0,
            duration: 1.16,
          },
          index * 0.76,
        )
      })
    }, track)
  }

  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }

    resizeTimeout = setTimeout(() => {
      buildScene()
      ScrollTrigger.refresh()
    }, 160)
  }

  onBeforeUpdate(resetCardRefs)

  onMounted(() => {
    scrollWindowToTopInstantly()
    buildScene()
    window.addEventListener('resize', handleResize, { passive: true })
  })

  onUnmounted(() => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
      resizeTimeout = null
    }

    window.removeEventListener('resize', handleResize)
    destroyScene()
  })

  return {
    scrollTrackRef,
    mainTitleRef,
    scrollHintRef,
    setCardRef,
  }
}
