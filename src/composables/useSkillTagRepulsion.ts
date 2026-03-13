import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

type TagMotion = {
  el: HTMLElement
  centerX: number
  centerY: number
  xTo: (value: number) => void
  yTo: (value: number) => void
}

const REPULSION_RADIUS = 120
const REPULSION_STRENGTH = 18
const REPULSION_RADIUS_SQ = REPULSION_RADIUS * REPULSION_RADIUS

export function useSkillTagRepulsion() {
  const skillContainer = ref<HTMLElement | null>(null)
  const skillTagEls = ref<HTMLElement[]>([])

  let tagMotions: TagMotion[] = []
  let pendingMouseX = 0
  let pendingMouseY = 0
  let pointerFrame: number | null = null
  let metricsFrame: number | null = null
  let handleResize: (() => void) | null = null

  const setSkillTagRef = (el: Element | null, index: number) => {
    if (el instanceof HTMLElement) {
      skillTagEls.value[index] = el
    }
  }

  const cacheSkillTagMetrics = () => {
    tagMotions = skillTagEls.value
      .filter((tag): tag is HTMLElement => Boolean(tag))
      .map((tag) => ({
        el: tag,
        centerX: tag.offsetLeft + tag.offsetWidth / 2,
        centerY: tag.offsetTop + tag.offsetHeight / 2,
        xTo: gsap.quickTo(tag, 'x', { duration: 0.2, ease: 'power2.out', overwrite: true }),
        yTo: gsap.quickTo(tag, 'y', { duration: 0.2, ease: 'power2.out', overwrite: true }),
      }))
  }

  const scheduleSkillMetricsRefresh = () => {
    if (metricsFrame !== null) return

    metricsFrame = requestAnimationFrame(() => {
      cacheSkillTagMetrics()
      metricsFrame = null
    })
  }

  const applySkillRepulsion = () => {
    pointerFrame = null

    for (const tagMotion of tagMotions) {
      const dx = tagMotion.centerX - pendingMouseX
      const dy = tagMotion.centerY - pendingMouseY
      const distanceSq = dx * dx + dy * dy

      if (distanceSq < REPULSION_RADIUS_SQ) {
        const distance = Math.sqrt(distanceSq)
        const force = (1 - distance / REPULSION_RADIUS) * REPULSION_STRENGTH
        const angle = Math.atan2(dy, dx)

        tagMotion.xTo(Math.cos(angle) * force)
        tagMotion.yTo(Math.sin(angle) * force)
        continue
      }

      tagMotion.xTo(0)
      tagMotion.yTo(0)
    }
  }

  const handleSkillMouseMove = (e: MouseEvent) => {
    if (!skillContainer.value) return

    const containerRect = skillContainer.value.getBoundingClientRect()

    pendingMouseX = e.clientX - containerRect.left
    pendingMouseY = e.clientY - containerRect.top

    const nextFrame = pointerFrame ?? requestAnimationFrame(applySkillRepulsion)
    pointerFrame = nextFrame
  }

  const handleSkillMouseLeave = () => {
    if (pointerFrame !== null) {
      cancelAnimationFrame(pointerFrame)
      pointerFrame = null
    }

    tagMotions.forEach(({ el }) => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    })
  }

  onMounted(async () => {
    await nextTick()
    cacheSkillTagMetrics()

    handleResize = () => {
      scheduleSkillMetricsRefresh()
    }
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    if (pointerFrame !== null) {
      cancelAnimationFrame(pointerFrame)
    }

    if (metricsFrame !== null) {
      cancelAnimationFrame(metricsFrame)
    }

    if (handleResize) {
      window.removeEventListener('resize', handleResize)
    }
  })

  return {
    skillContainer,
    setSkillTagRef,
    scheduleSkillMetricsRefresh,
    handleSkillMouseMove,
    handleSkillMouseLeave,
  }
}
