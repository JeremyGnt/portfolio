import { onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollWindowToTopInstantly } from '../utils/scroll'

gsap.registerPlugin(ScrollTrigger)

const logoSpinTriggerThreshold = 0.82
const logoSpinResetThreshold = 0.68
const mobileExperienceBreakpoint = '(max-width: 720px)'
const mobileFirstCardOffset = 24
const mobileCardHeaderGap = 10
const mobileCardEntrySpacingViewportFactor = 0.52
const mobileHeroSpaceViewportFactor = 0.46
const mobileCardStageEntryViewportFactor = 0.12
const mobileBottomSceneViewportFactor = 0.34
const mobileBottomSceneMinimum = 160
const mobileBottomNavClearance = 16
const mobileScrollHintFadeDistance = 96

const mobileSceneCssVars = [
  '--experience-mobile-first-top',
  '--experience-mobile-second-top',
  '--experience-mobile-third-top',
  '--experience-mobile-hero-space',
  '--experience-mobile-entry-space',
  '--experience-mobile-stack-spacing',
  '--experience-mobile-bottom-space',
] as const

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

const clearCardAnimationStyles = (cards: HTMLElement[]) => {
  cards.forEach((card) => {
    gsap.set(card, {
      clearProps: 'transform,opacity,visibility,will-change',
    })
  })
}

const clearMobileSceneStyles = (stage: HTMLElement) => {
  mobileSceneCssVars.forEach((cssVar) => {
    stage.style.removeProperty(cssVar)
  })
}

const syncMobileSceneStyles = (
  cards: HTMLElement[],
  stage: HTMLElement,
  header: HTMLElement | null,
): void => {
  const headerBottom = Math.round(header?.getBoundingClientRect().bottom ?? 56)
  const bottomNavTop = Math.round(
    document.querySelector<HTMLElement>('.header-menu')?.getBoundingClientRect().top ??
      window.innerHeight - mobileBottomNavClearance,
  )
  const stickyTops = cards.map((_, index) => {
    if (index === 0) {
      return headerBottom + mobileFirstCardOffset
    }

    return 0
  })

  for (let index = 1; index < stickyTops.length; index += 1) {
    stickyTops[index] = stickyTops[index - 1] + getPinnedHeaderHeight(cards[index - 1]) + mobileCardHeaderGap
  }

  const lastCard = cards.at(-1)
  const lastTop = stickyTops.at(-1) ?? headerBottom + mobileFirstCardOffset
  const lastCardHeight = Math.ceil(lastCard?.getBoundingClientRect().height ?? 0)
  const availableBottom = bottomNavTop - mobileBottomNavClearance
  const bottomSpace = Math.max(
    availableBottom - (lastTop + lastCardHeight) + Math.max(window.innerHeight * mobileBottomSceneViewportFactor, 180),
    mobileBottomSceneMinimum,
  )
  const heroSpace = Math.max(window.innerHeight * mobileHeroSpaceViewportFactor, 280)
  const entrySpace = Math.max(window.innerHeight * mobileCardStageEntryViewportFactor, 72)
  const stackSpacing = Math.max(window.innerHeight * mobileCardEntrySpacingViewportFactor, 280)

  stage.style.setProperty('--experience-mobile-first-top', `${Math.round(stickyTops[0] ?? 96)}px`)
  stage.style.setProperty('--experience-mobile-second-top', `${Math.round(stickyTops[1] ?? stickyTops[0] ?? 156)}px`)
  stage.style.setProperty('--experience-mobile-third-top', `${Math.round(stickyTops[2] ?? stickyTops[1] ?? 216)}px`)
  stage.style.setProperty('--experience-mobile-hero-space', `${Math.round(heroSpace)}px`)
  stage.style.setProperty('--experience-mobile-entry-space', `${Math.round(entrySpace)}px`)
  stage.style.setProperty('--experience-mobile-stack-spacing', `${Math.round(stackSpacing)}px`)
  stage.style.setProperty('--experience-mobile-bottom-space', `${Math.round(bottomSpace)}px`)

  clearCardAnimationStyles(cards)
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

  const syncMobileScrollHint = () => {
    if (!window.matchMedia(mobileExperienceBreakpoint).matches || !scrollHintRef.value) {
      return
    }

    gsap.to(scrollHintRef.value, {
      autoAlpha: window.scrollY > mobileScrollHintFadeDistance ? 0 : 0.72,
      duration: 0.18,
      overwrite: true,
    })
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

    const isMobileScene = window.matchMedia(mobileExperienceBreakpoint).matches

    clearMobileSceneStyles(stage)

    if (isMobileScene) {
      syncMobileSceneStyles(cards, stage, header)
      syncMobileScrollHint()
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
      if (!window.matchMedia(mobileExperienceBreakpoint).matches) {
        ScrollTrigger.refresh()
      }
    }, 160)
  }

  const handleScroll = () => {
    syncMobileScrollHint()
  }

  onBeforeUpdate(resetCardRefs)

  onMounted(() => {
    scrollWindowToTopInstantly()
    buildScene()
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
      resizeTimeout = null
    }

    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll)
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
