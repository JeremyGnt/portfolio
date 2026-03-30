import { nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollWindowToTopInstantly, waitForNextAnimationFrame } from '../utils/scroll'

gsap.registerPlugin(ScrollTrigger)

const anchorScrollDistanceFactor = 2.45
const anchorScrub = 0.72
const anchorDockingProgressThreshold = 0.41
const mobileBreakpoint = 768
const dockStateThresholdEpsilon = 0.5
const defaultDockState = {
  dockingScrollThreshold: 0,
  isDocked: false,
  progress: 0,
}

type HomeLogoDockStateDetail = typeof defaultDockState
type HomeLogoDockStateWindow = Window & {
  __homeLogoDockState?: HomeLogoDockStateDetail
}

export function useHomeLogoAnchoring() {
  let resizeTimer: number | null = null
  let stTimeline: gsap.core.Timeline | null = null
  let handleResize: (() => void) | null = null
  let handleLogoReady: ((event: Event) => void) | null = null
  let lastDockState: HomeLogoDockStateDetail = defaultDockState

  const dispatchDockState = (detail: HomeLogoDockStateDetail, force = false) => {
    if (typeof window === 'undefined') {
      return
    }

    const shouldDispatch =
      force
      || detail.isDocked !== lastDockState.isDocked
      || Math.abs(detail.dockingScrollThreshold - lastDockState.dockingScrollThreshold) > dockStateThresholdEpsilon

    lastDockState = detail

    if (!shouldDispatch) {
      return
    }

    ;(window as HomeLogoDockStateWindow).__homeLogoDockState = detail
    window.dispatchEvent(new CustomEvent<HomeLogoDockStateDetail>('home-logo-dock-state', { detail }))
  }

  const syncLogoVisibility = (logoEl: HTMLElement) => {
    const isReady = logoEl.dataset.threeReady === 'true'
    gsap.set(logoEl, { autoAlpha: isReady ? 1 : 0 })
  }

  const destroyAnchoring = () => {
    stTimeline?.kill()
    stTimeline = null
    dispatchDockState(defaultDockState, true)
  }

  const calculateAndSetLogoAnimations = () => {
    const logoJ = document.getElementById('logo-j')
    const logoG = document.getElementById('logo-g')
    const targetJ = document.getElementById('target-j')
    const targetG = document.getElementById('target-g')
    const titleFadeTexts = document.querySelectorAll('.home-hero-title .fade-text')
    const otherFadeTexts = document.querySelectorAll(
      '.home-hero .fade-text:not(.home-hero-title .fade-text)',
    )
    const fadeTexts = [...titleFadeTexts, ...otherFadeTexts]
    const logoBg = document.getElementById('header-logo-bg')

    if (window.innerWidth <= mobileBreakpoint || !logoJ || !logoG || !targetJ || !targetG || !logoBg) {
      destroyAnchoring()
      gsap.set(fadeTexts, { clearProps: 'all' })
      if (targetJ && targetG) {
        gsap.set([targetJ, targetG], { clearProps: 'all' })
      }

      if (window.innerWidth <= mobileBreakpoint && logoJ && logoG && logoBg) {
        gsap.set([logoJ, logoG], { clearProps: 'x,y,scale,transformOrigin' })
        syncLogoVisibility(logoJ)
        syncLogoVisibility(logoG)
        gsap.set(logoBg, { clearProps: 'all', opacity: 1 })
      } else {
        if (logoJ && logoG) {
          gsap.set([logoJ, logoG], { clearProps: 'all' })
        }
        if (logoBg) {
          gsap.set(logoBg, { clearProps: 'all' })
        }
      }
      return
    }

    gsap.set([logoJ, logoG, fadeTexts, logoBg], { clearProps: 'all' })
    destroyAnchoring()

    ScrollTrigger.refresh()

    const rectJ = logoJ.getBoundingClientRect()
    const rectG = logoG.getBoundingClientRect()
    const rectTargetJ = targetJ.getBoundingClientRect()
    const rectTargetG = targetG.getBoundingClientRect()

    const getDeltas = (elRect: DOMRect, targetRect: DOMRect) => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const scrollX = window.scrollX || document.documentElement.scrollLeft

      const absoluteTargetCenterX = targetRect.left + scrollX + targetRect.width / 2
      const absoluteTargetCenterY = targetRect.top + scrollY + targetRect.height / 2

      const fixedElCenterX = elRect.left + elRect.width / 2
      const fixedElCenterY = elRect.top + elRect.height / 2

      const deltaX = absoluteTargetCenterX - fixedElCenterX
      const deltaY = absoluteTargetCenterY - fixedElCenterY

      const scaleY = targetRect.height / elRect.height
      const scale = scaleY * 1.5

      return { deltaX, deltaY, scale }
    }

    const dJ = getDeltas(rectJ, rectTargetJ)
    const dG = getDeltas(rectG, rectTargetG)

    gsap.set(logoJ, {
      x: dJ.deltaX + 23,
      y: dJ.deltaY,
      scale: dJ.scale,
      transformOrigin: '50% 50%',
      force3D: true,
    })
    gsap.set(logoG, {
      x: dG.deltaX - 21,
      y: dG.deltaY,
      scale: dG.scale,
      transformOrigin: '50% 50%',
      force3D: true,
    })

    syncLogoVisibility(logoJ)
    syncLogoVisibility(logoG)
    gsap.set([targetJ, targetG], { autoAlpha: 0 })
    gsap.set(logoBg, { opacity: 0 })

    stTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: () => '+=' + dJ.deltaY * anchorScrollDistanceFactor,
        scrub: anchorScrub,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          const dockingScrollThreshold =
            self.start + (self.end - self.start) * anchorDockingProgressThreshold

          dispatchDockState({
            dockingScrollThreshold,
            isDocked: self.progress >= anchorDockingProgressThreshold - 0.0001,
            progress: self.progress,
          })
        },
        onUpdate: (self) => {
          const dockingScrollThreshold =
            self.start + (self.end - self.start) * anchorDockingProgressThreshold

          dispatchDockState({
            dockingScrollThreshold,
            isDocked: self.progress >= anchorDockingProgressThreshold - 0.0001,
            progress: self.progress,
          })
        },
      },
    })

    stTimeline.to(titleFadeTexts, { opacity: 0, y: -40, ease: 'power1.out' }, 0)
    stTimeline.to(otherFadeTexts, { opacity: 0, y: -40, stagger: 0.1, ease: 'power1.out' }, 0)

    const dockingDuration = stTimeline.duration() * anchorDockingProgressThreshold
    const dockingTime = stTimeline.duration() * anchorDockingProgressThreshold

    stTimeline.to(
      logoJ,
      {
        x: 20,
        y: 0,
        scale: 1,
        ease: 'none',
        duration: dockingDuration,
        transformOrigin: '50% 50%',
        force3D: true,
      },
      0,
    )
    stTimeline.to(
      logoG,
      {
        x: -20,
        y: 0,
        scale: 1,
        ease: 'none',
        duration: dockingDuration,
        transformOrigin: '50% 50%',
        force3D: true,
      },
      0,
    )
    stTimeline.set(logoBg, { opacity: 1 }, dockingTime)

    if (stTimeline.scrollTrigger) {
      const { progress, start, end } = stTimeline.scrollTrigger
      const dockingScrollThreshold = start + (end - start) * anchorDockingProgressThreshold

      dispatchDockState({
        dockingScrollThreshold,
        isDocked: progress >= anchorDockingProgressThreshold - 0.0001,
        progress,
      }, true)
    }
  }

  const onResizeGSAP = () => {
    if (resizeTimer !== null) {
      globalThis.clearTimeout(resizeTimer)
    }

    resizeTimer = globalThis.setTimeout(() => {
      calculateAndSetLogoAnimations()
    }, 150)
  }

  onMounted(async () => {
    scrollWindowToTopInstantly()
    await nextTick()
    await waitForNextAnimationFrame()

    handleLogoReady = (event: Event) => {
      const logoEl = event.currentTarget as HTMLElement | null
      if (!logoEl) return
      gsap.to(logoEl, { autoAlpha: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
    }

    const logoJ = document.getElementById('logo-j')
    const logoG = document.getElementById('logo-g')
    if (logoJ && logoG && handleLogoReady) {
      logoJ.addEventListener('logo3d-ready', handleLogoReady)
      logoG.addEventListener('logo3d-ready', handleLogoReady)
    }

    calculateAndSetLogoAnimations()

    handleResize = () => {
      onResizeGSAP()
    }
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    if (handleResize) {
      window.removeEventListener('resize', handleResize)
    }

    if (resizeTimer !== null) {
      globalThis.clearTimeout(resizeTimer)
      resizeTimer = null
    }

    destroyAnchoring()

    const logoJ = document.getElementById('logo-j')
    const logoG = document.getElementById('logo-g')
    if (logoJ && handleLogoReady) {
      logoJ.removeEventListener('logo3d-ready', handleLogoReady)
    }
    if (logoG && handleLogoReady) {
      logoG.removeEventListener('logo3d-ready', handleLogoReady)
    }
    handleLogoReady = null

    if (logoJ && logoG) {
      gsap.killTweensOf([logoJ, logoG])
      gsap.set([logoJ, logoG], { clearProps: 'x,y,scale,transformOrigin' })
    }

    const pillContainer = document.querySelector('.header-logo-card')
    if (pillContainer instanceof HTMLElement) {
      gsap.killTweensOf(pillContainer)
      gsap.set(pillContainer, { clearProps: 'scale,transformOrigin' })
    }

    dispatchDockState(defaultDockState, true)
  })
}
