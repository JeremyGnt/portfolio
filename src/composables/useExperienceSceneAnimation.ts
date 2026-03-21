import { onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollWindowToTopInstantly } from '../utils/scroll'

gsap.registerPlugin(ScrollTrigger)

const mobileExperienceBreakpoint = '(max-width: 720px)'
const mobileFirstCardOffset = 24
const mobileCardHeaderGap = 10

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

const getPinnedHeaderHeight = (card: HTMLElement) => {
  const header = card.querySelector<HTMLElement>('.experience-card__header')

  if (!header) {
    return 84
  }

  const cardRect = card.getBoundingClientRect()
  const headerRect = header.getBoundingClientRect()

  return Math.max(headerRect.bottom - cardRect.top, 84)
}

const createMobileSceneConfig = (
  cards: HTMLElement[],
  stage: HTMLElement,
  header: HTMLElement | null,
): SceneAnimationConfig => {
  const stageRect = stage.getBoundingClientRect()
  const stageTop = stageRect.top
  const headerBottom = header?.getBoundingClientRect().bottom ?? stageTop
  let stackedTop = Math.max(headerBottom + mobileFirstCardOffset - stageTop, 0)

  const cardStates = cards.map((card, index) => {
    const cardRect = card.getBoundingClientRect()
    const naturalTop = cardRect.top - stageTop
    const targetY = stackedTop - naturalTop
    const initialY = Math.max(stageRect.height - naturalTop + 56, cardRect.height * 0.95)

    stackedTop += getPinnedHeaderHeight(card) + mobileCardHeaderGap

    return {
      card,
      initialY,
      position: index * 1.14,
      vars: {
        y: targetY,
        duration: 0.98,
      } satisfies gsap.TweenVars,
    }
  })

  return {
    endPercent: Math.max(cards.length * 125, 360),
    setup: () => {
      cardStates.forEach(({ card, initialY }) => {
        gsap.set(card, {
          y: initialY,
          autoAlpha: 1,
          willChange: 'transform',
        })
      })
    },
    entries: cardStates.map(({ card, position, vars }) => ({
      element: card,
      position,
      vars,
    })),
  }
}

export function useExperienceSceneAnimation() {
  const scrollTrackRef = ref<HTMLElement | null>(null)
  const cardsStageRef = ref<HTMLElement | null>(null)
  const mainTitleRef = ref<HTMLElement | null>(null)
  const scrollHintRef = ref<HTMLElement | null>(null)
  const cardRefs = ref<HTMLElement[]>([])

  let context: gsap.Context | null = null
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

    context = gsap.context(() => {
      const isMobileScene = window.matchMedia(mobileExperienceBreakpoint).matches
      const sceneConfig = isMobileScene
        ? createMobileSceneConfig(cards, stage, header)
        : createDesktopSceneConfig(cards)

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

      sceneConfig.entries.forEach(({ element, position, vars }) => {
        timeline.to(
          element,
          vars,
          position,
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
    cardsStageRef,
    mainTitleRef,
    scrollHintRef,
    setCardRef,
  }
}
