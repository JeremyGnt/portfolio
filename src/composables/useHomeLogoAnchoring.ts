import { nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollWindowToTopInstantly, waitForNextAnimationFrame } from '../utils/scroll'

gsap.registerPlugin(ScrollTrigger)

const anchorScrollDistanceFactor = 3.4
const anchorScrub = 0.95
const mobileBreakpoint = 768

export function useHomeLogoAnchoring() {
  let resizeTimer: number | null = null
  let stTimeline: gsap.core.Timeline | null = null
  let handleResize: (() => void) | null = null
  let handleLogoReady: ((event: Event) => void) | null = null

  const syncLogoVisibility = (logoEl: HTMLElement) => {
    const isReady = logoEl.dataset.threeReady === 'true'
    gsap.set(logoEl, { autoAlpha: isReady ? 1 : 0 })
  }

  const destroyAnchoring = () => {
    stTimeline?.kill()
    stTimeline = null
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
      if (logoJ && logoG) {
        gsap.set([logoJ, logoG], { clearProps: 'all' })
      }
      if (logoBg) {
        gsap.set(logoBg, { clearProps: 'all' })
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

    gsap.set(logoJ, { x: dJ.deltaX + 23, y: dJ.deltaY, scale: dJ.scale, transformOrigin: '50% 50%' })
    gsap.set(logoG, { x: dG.deltaX - 21, y: dG.deltaY, scale: dG.scale, transformOrigin: '50% 50%' })

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
      },
    })

    const dockingDuration = 0.5

    stTimeline.to(logoJ, { x: 20, y: 0, scale: 1, ease: 'none', duration: dockingDuration }, 0)
    stTimeline.to(logoG, { x: -20, y: 0, scale: 1, ease: 'none', duration: dockingDuration }, 0)
    stTimeline.to(logoBg, { opacity: 1, ease: 'power2.inOut' }, 0)
    stTimeline.to(titleFadeTexts, { opacity: 0, y: -40, ease: 'power1.out' }, 0)
    stTimeline.to(otherFadeTexts, { opacity: 0, y: -40, stagger: 0.1, ease: 'power1.out' }, 0)

    // Start bounce exactly when docking ends, not at timeline end.
    const pillContainer = document.querySelector('.header-logo-card')
    if (pillContainer) {
      stTimeline.to(
        pillContainer,
        {
          scale: 1.08,
          duration: 0.15,
          ease: 'power2.out',
          transformOrigin: '50% 50%',
        },
        dockingDuration,
      )
      stTimeline.to(
        pillContainer,
        {
          scale: 1,
          duration: 0.4,
          ease: 'back.out(3)',
        },
        dockingDuration + 0.15,
      )
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
  })
}
