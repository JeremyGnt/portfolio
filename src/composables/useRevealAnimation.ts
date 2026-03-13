import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

export function triggerReveal(selector = '.reveal') {
  const revealEls = document.querySelectorAll(selector)
  revealEls.forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 24 })
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      delay: i * 0.08,
      ease: 'power2.out',
    })
  })
}

export function useRevealAnimation(delay = 100, selector = '.reveal') {
  let revealTimeout: number | null = null

  onMounted(() => {
    revealTimeout = globalThis.setTimeout(() => {
      triggerReveal(selector)
    }, delay)
  })

  onUnmounted(() => {
    if (revealTimeout !== null) {
      globalThis.clearTimeout(revealTimeout)
      revealTimeout = null
    }
  })
}
