import { nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useHomeLogoAnchoring() {
  let resizeTimer: number | null = null
  let stTimeline: gsap.core.Timeline | null = null
  let handleResize: (() => void) | null = null

  const calculateAndSetLogoAnimations = () => {
    const logoJ = document.getElementById('logo-j')
    const logoG = document.getElementById('logo-g')
    const targetJ = document.getElementById('target-j')
    const targetG = document.getElementById('target-g')
    const fadeTexts = document.querySelectorAll('.fade-text')
    const logoBg = document.getElementById('header-logo-bg')

    if (!logoJ || !logoG || !targetJ || !targetG || !logoBg) return

    gsap.set([logoJ, logoG, fadeTexts, logoBg], { clearProps: 'all' })
    stTimeline?.kill()
    stTimeline = null

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
    gsap.set(logoG, { x: dG.deltaX - 24, y: dG.deltaY, scale: dG.scale, transformOrigin: '50% 50%' })

    gsap.set([logoJ, logoG], { opacity: 1 })
    gsap.set([targetJ, targetG], { opacity: 0 })
    gsap.set(logoBg, { opacity: 0 })

    stTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: () => '+=' + dJ.deltaY * 2.5,
        scrub: 2.5,
      },
    })

    stTimeline.to(logoJ, { x: 20, y: 0, scale: 1, ease: 'none' }, 0)
    stTimeline.to(logoG, { x: -20, y: 0, scale: 1, ease: 'none' }, 0)
    stTimeline.to(logoBg, { opacity: 1, ease: 'power2.inOut' }, 0)
    stTimeline.to(fadeTexts, { opacity: 0, y: -40, stagger: 0.1, ease: 'power1.out' }, 0)
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
    await nextTick()
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

    stTimeline?.kill()
    stTimeline = null

    const logoJ = document.getElementById('logo-j')
    const logoG = document.getElementById('logo-g')
    if (logoJ && logoG) {
      gsap.set([logoJ, logoG], { clearProps: 'x,y,scale,transformOrigin' })
    }
  })
}
