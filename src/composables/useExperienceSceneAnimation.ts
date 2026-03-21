import { onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollWindowToTopInstantly } from '../utils/scroll'

gsap.registerPlugin(ScrollTrigger)

const mobileExperienceBreakpoint = '(max-width: 720px)'
const cardsReadyProgress = 0.94

type SceneAnimationConfig = {
  endPercent: number
  setup: () => void
  entries: Array<{
    element: HTMLElement
    position: number
    vars: gsap.TweenVars
  }>
}

const createDesktopSceneConfig = (cards: HTMLElement[]): SceneAnimationConfig => ({
  endPercent: Math.max(cards.length * 90, 250),
  setup: () => {
    gsap.set(cards, {
      yPercent: 140,
      autoAlpha: 1,
      willChange: 'transform',
    })
  },
  entries: cards.map((card, index) => ({
    element: card,
    position: index * 0.76,
    vars: {
      yPercent: 0,
      duration: 1.16,
    },
  })),
})

export function useExperienceSceneAnimation() {
  const scrollTrackRef = ref<HTMLElement | null>(null)
  const cardsStageRef = ref<HTMLElement | null>(null)
  const mainTitleRef = ref<HTMLElement | null>(null)
  const scrollHintRef = ref<HTMLElement | null>(null)
  const cardRefs = ref<HTMLElement[]>([])

  let context: gsap.Context | null = null
  let sceneTrigger: ScrollTrigger | null = null
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null
  let isHeaderCompacted = false

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
    sceneTrigger = null

    const header = document.querySelector<HTMLElement>('.app-header')
    if (header) {
      header.classList.remove('app-header--menu-compact')
    }

    isHeaderCompacted = false
    window.dispatchEvent(new CustomEvent('experience-menu-compact-change', { detail: { compact: false } }))
  }

  const buildScene = () => {
    const track = scrollTrackRef.value
    const stage = cardsStageRef.value
    const cards = cardRefs.value.filter(Boolean)
    const header = document.querySelector<HTMLElement>('.app-header')

    destroyScene()

    if (!track || !stage || cards.length === 0) {
      return
    }

    if (window.matchMedia(mobileExperienceBreakpoint).matches) {
      sceneTrigger = null
      return
    }

    context = gsap.context(() => {
      const sceneConfig = createDesktopSceneConfig(cards)

      sceneConfig.setup()

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: `+=${sceneConfig.endPercent}%`,
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

          },
        },
      })
      sceneTrigger = timeline.scrollTrigger ?? null

      sceneConfig.entries.forEach(({ element, position, vars }) => {
        timeline.to(
          element,
          vars,
          position,
        )
      })
    }, track)
  }

  const scrollToCardsStage = () => {
    if (sceneTrigger) {
      const start = Number(sceneTrigger.start) || 0
      const end = Number(sceneTrigger.end) || start
      const targetTop = start + (end - start) * cardsReadyProgress

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: 'smooth',
      })
      return
    }

    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth',
    })
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
    cardsStageRef,
    mainTitleRef,
    scrollHintRef,
    scrollToCardsStage,
    setCardRef,
  }
}
