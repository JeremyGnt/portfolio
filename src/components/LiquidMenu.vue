<script setup lang="ts">
import { Ellipsis } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type MenuItem = {
  text: string
  path: string
  icon: string
}

type CompactMenuEvent = CustomEvent<{ compact?: boolean }>

const route = useRoute()
const router = useRouter()
const compactSize = 58

const items: MenuItem[] = [
  { text: 'À propos', path: '/', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>' },
  { text: 'Expériences', path: '/experience', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>' },
  { text: 'Projets', path: '/projects', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>' },
  { text: 'Contact', path: '/contact', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' },
]

function getActiveIndexFromRoute() {
  const index = items.findIndex((item) => item.path === route.path)
  return Math.max(index, 0)
}

const menuRootRef = ref<HTMLElement | null>(null)
const menuShellRef = ref<HTMLElement | null>(null)
const menuTrackRef = ref<HTMLElement | null>(null)
const itemRefs = ref<HTMLElement[]>([])
const activeIndex = ref(getActiveIndexFromRoute())
const isMoving = ref(false)
const isGrowing = ref(false)
const moveDuration = ref(0.8)
const growDuration = ref(0.46)
const bubbleStyle = ref({ width: '0px', height: '0px', left: '0px', top: '0px' })
const isBubbleTransitionSuppressed = ref(true)
const isCompactMode = ref(false)
const expandedWidth = ref(0)

const bubbleInlineStyle = computed(() => ({
  ...bubbleStyle.value,
  '--move-duration': isBubbleTransitionSuppressed.value ? '0s' : `${moveDuration.value}s`,
  '--grow-duration': `${growDuration.value}s`,
}))

const menuShellStyle = computed(() => ({
  '--compact-size': `${compactSize}px`,
  '--menu-shell-width': expandedWidth.value > 0 ? `${expandedWidth.value}px` : 'max-content',
}))

let moveTimeout: ReturnType<typeof setTimeout> | null = null
let growTimeout: ReturnType<typeof setTimeout> | null = null
let compactSyncTimeout: ReturnType<typeof setTimeout> | null = null
let bubbleTransitionRestoreFrame: number | null = null
let bubbleTransitionRestoreNestedFrame: number | null = null

const getMoveDurationForDistance = (distance: number) => {
  if (distance <= 0) {
    return 0.2
  }

  if (distance === 1) {
    return 0.52
  }

  return 0.2 + distance * 0.2
}

const setItemRef = (element: Element | null, index: number) => {
  if (element) {
    itemRefs.value[index] = element as HTMLElement
  }
}

const cancelBubbleTransitionRestore = () => {
  if (bubbleTransitionRestoreFrame !== null) {
    cancelAnimationFrame(bubbleTransitionRestoreFrame)
    bubbleTransitionRestoreFrame = null
  }

  if (bubbleTransitionRestoreNestedFrame !== null) {
    cancelAnimationFrame(bubbleTransitionRestoreNestedFrame)
    bubbleTransitionRestoreNestedFrame = null
  }
}

const restoreBubbleTransitions = () => {
  cancelBubbleTransitionRestore()
  isBubbleTransitionSuppressed.value = false
}

const setBubble = ({ immediate = false }: { immediate?: boolean } = {}) => {
  const activeItem = itemRefs.value[activeIndex.value]
  const parent = menuTrackRef.value

  if (!activeItem || !parent) {
    return
  }

  if (immediate) {
    cancelBubbleTransitionRestore()
    isBubbleTransitionSuppressed.value = true
  }
  else {
    restoreBubbleTransitions()
  }

  const parentRect = parent.getBoundingClientRect()
  const itemRect = activeItem.getBoundingClientRect()

  bubbleStyle.value = {
    width: `${itemRect.width}px`,
    height: `${itemRect.height}px`,
    left: `${itemRect.left - parentRect.left}px`,
    top: `${itemRect.top - parentRect.top}px`,
  }

  if (immediate) {
    bubbleTransitionRestoreFrame = requestAnimationFrame(() => {
      bubbleTransitionRestoreFrame = null
      bubbleTransitionRestoreNestedFrame = requestAnimationFrame(() => {
        bubbleTransitionRestoreNestedFrame = null
        isBubbleTransitionSuppressed.value = false
      })
    })
  }
}

const updateLayoutMetrics = () => {
  const track = menuTrackRef.value
  if (!track) {
    return
  }

  expandedWidth.value = Math.ceil(track.scrollWidth)
}

const syncMenuLayout = (immediate = false) => {
  updateLayoutMetrics()
  setBubble({ immediate })
}

const scheduleMenuLayoutSync = () => {
  if (isMoving.value) {
    if (compactSyncTimeout) {
      clearTimeout(compactSyncTimeout)
    }

    compactSyncTimeout = setTimeout(() => {
      syncMenuLayout(true)
      compactSyncTimeout = null
    }, moveDuration.value * 1000)

    return
  }

  nextTick(() => {
    syncMenuLayout(true)

    requestAnimationFrame(() => {
      syncMenuLayout(true)
    })
  })

  if (compactSyncTimeout) {
    clearTimeout(compactSyncTimeout)
  }

  compactSyncTimeout = setTimeout(() => {
    syncMenuLayout(true)
    compactSyncTimeout = null
  }, 560)
}

const selectItem = (index: number) => {
  if (activeIndex.value !== index) {
    const distance = Math.abs(index - activeIndex.value)
    const calculatedDuration = getMoveDurationForDistance(distance)
    const calculatedGrowDuration = Math.max(0.44, calculatedDuration * 1.1)
    const growReleaseDelay = Math.max(0.28, calculatedDuration * 0.72)

    moveDuration.value = calculatedDuration
    growDuration.value = calculatedGrowDuration
    activeIndex.value = index
    isMoving.value = true
    isGrowing.value = true
    setBubble()

    if (growTimeout) {
      clearTimeout(growTimeout)
    }
    growTimeout = setTimeout(() => {
      isGrowing.value = false
    }, growReleaseDelay * 1000)

    if (moveTimeout) {
      clearTimeout(moveTimeout)
    }
    moveTimeout = setTimeout(() => {
      isMoving.value = false
      syncMenuLayout(true)
    }, calculatedDuration * 1000)
  }

  router.push(items[index].path)
}

const handleCompactModeChange = (event: Event) => {
  const compact = Boolean((event as CompactMenuEvent).detail?.compact)
  isCompactMode.value = compact
  scheduleMenuLayoutSync()
}

const handleMenuShellTransitionEnd = (event: TransitionEvent) => {
  if (event.propertyName === 'width') {
    syncMenuLayout(true)
  }
}

const handleWindowResize = () => {
  syncMenuLayout(true)
}

watch(
  () => route.path,
  () => {
    const nextIndex = getActiveIndexFromRoute()

    if (activeIndex.value !== nextIndex) {
      const distance = Math.abs(nextIndex - activeIndex.value)
      moveDuration.value = getMoveDurationForDistance(distance)
      activeIndex.value = nextIndex
    }

    scheduleMenuLayoutSync()
  },
)

watch(isCompactMode, () => {
  scheduleMenuLayoutSync()
})

onMounted(() => {
  scheduleMenuLayoutSync()

  isCompactMode.value = document.querySelector('.app-header')?.classList.contains('app-header--menu-compact') ?? false

  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('experience-menu-compact-change', handleCompactModeChange as EventListener)
  menuShellRef.value?.addEventListener('transitionend', handleMenuShellTransitionEnd)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('experience-menu-compact-change', handleCompactModeChange as EventListener)
  menuShellRef.value?.removeEventListener('transitionend', handleMenuShellTransitionEnd)

  if (moveTimeout) {
    clearTimeout(moveTimeout)
  }

  if (growTimeout) {
    clearTimeout(growTimeout)
  }

  if (compactSyncTimeout) {
    clearTimeout(compactSyncTimeout)
  }

  cancelBubbleTransitionRestore()
})
</script>

<template>
  <nav
    ref="menuRootRef"
    class="liquid-menu"
    :style="menuShellStyle"
    :class="{
      'is-compact': isCompactMode,
    }"
  >
    <div
      ref="menuShellRef"
      class="menu-shell"
      :class="{ 'has-compact-toggle': isCompactMode }"
    >
      <div class="menu-shell-viewport">
        <div class="menu-bg"></div>
        <div ref="menuTrackRef" class="menu-shell-track">
          <ul class="menu-list" :aria-hidden="isCompactMode">
            <li
              v-for="(item, index) in items"
              :key="item.path"
              :ref="(el) => setItemRef(el, index)"
              class="menu-item"
              :class="{ active: activeIndex === index }"
              @click="selectItem(index)"
            >
              <div class="item-content">
                <span class="item-icon" v-html="item.icon" />
                <span class="item-text">{{ item.text }}</span>
              </div>
            </li>
          </ul>

          <button
            v-if="isCompactMode"
            class="compact-trigger"
            type="button"
            aria-hidden="true"
            tabindex="-1"
          >
            <Ellipsis :size="18" />
          </button>
        </div>
      </div>
      <div
        class="active-bubble"
        :class="{ moving: isMoving, growing: isGrowing }"
        :style="bubbleInlineStyle"
      />
    </div>

    <svg style="display:none;">
      <filter id="menuDisplacementFilter">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.015"
          numOctaves="3"
          result="turbulence"
        />

        <feDisplacementMap
          in="SourceGraphic"
          in2="turbulence"
          scale="45"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="menuBgDisplacementFilter">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.01"
          numOctaves="2"
          result="turbulence"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="turbulence"
          scale="25"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  </nav>
</template>

<style scoped>
.liquid-menu {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  max-width: 100%;
  overflow: visible;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --compact-size: var(--header-pill-height, 58px);
  --menu-shell-width: 0px;
}

.menu-shell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: var(--menu-shell-width);
  max-width: 100%;
  min-height: var(--compact-size);
  overflow: visible;
  border-radius: 999px;
  transform-origin: right center;
  transition:
    width 0.52s linear,
    transform 0.3s ease-out,
    box-shadow 0.28s ease;
}

.menu-shell-viewport {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  min-height: inherit;
  overflow: hidden;
  border-radius: inherit;
}

.menu-shell-track {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: max-content;
  min-height: var(--compact-size);
}

.compact-trigger {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  width: var(--compact-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: #ffffff;
  background: transparent;
  pointer-events: none;
  transition:
    color 0.25s ease,
    transform 0.25s ease,
    opacity 0.25s ease;
}

.liquid-menu:not(.is-compact) .compact-trigger {
  display: none;
}

.liquid-menu.is-compact {
  min-width: var(--compact-size);
}

.liquid-menu.is-compact .menu-shell {
  width: var(--compact-size);
  transform: translateY(0) scale(1);
}

.menu-bg {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: rgba(15, 15, 15, 0.1);
  backdrop-filter: brightness(1.2) blur(1px) url(#menuDisplacementFilter);
  box-shadow:
    inset 1px 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset -1px -1px 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 8px 1px rgba(255, 255, 255, 0.15),
    0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 0;
}

.menu-list {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  list-style: none;
  margin: 0;
  padding: 6px;
  transition:
    opacity 0.2s ease,
    transform 0.52s linear;
}

.menu-shell.has-compact-toggle .menu-list {
  padding-right: calc(var(--compact-size) + 6px);
}

.menu-item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--compact-size) - 12px);
  box-sizing: border-box;
  padding: 10px 24px;
  color: #909090;
  font-family: system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
  user-select: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.menu-item.active,
.menu-item:hover {
  color: #ffffff;
  z-index: 3;
}

.menu-item.active .item-content,
.menu-item:hover .item-content {
  transform: scale(1.05);
}

.item-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease-in-out;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-text {
  white-space: nowrap;
}

.active-bubble {
  position: absolute;
  z-index: 2;
  border-radius: 35px;
  pointer-events: none;
  transform: scale(1);
  transition:
    left var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    top var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    width var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    height var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    backdrop-filter 0.3s ease,
    background-color 0.3s ease,
    box-shadow 0.3s ease,
    transform var(--grow-duration, 0.46s) cubic-bezier(0.22, 1, 0.36, 1);
  backdrop-filter: blur(20px) saturate(1.1);
  background-color: rgba(255, 255, 255, 0.18);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.25),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    0 4px 15px rgba(0, 0, 0, 0.15);
}

.liquid-menu.is-compact .menu-list,
.liquid-menu.is-compact .active-bubble {
  opacity: 0;
  pointer-events: none;
}

.liquid-menu.is-compact .menu-list {
  transform: translateX(14px);
}

.active-bubble.moving {
  backdrop-filter: brightness(1.2) blur(1px) url(#menuDisplacementFilter);
  background-color: rgba(255, 255, 255, 0.02);
  box-shadow:
    inset 1px 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset -1px -1px 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 8px 1px rgba(255, 255, 255, 0.15);
}

.active-bubble.growing {
  transform: scale(1.35);
  background-color: rgba(255, 255, 255, 0.02);
  box-shadow:
    inset 1px 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset -1px -1px 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 8px 1px rgba(255, 255, 255, 0.15);
}

@media (max-width: 900px) {
  .menu-shell,
  .liquid-menu.is-compact .menu-shell {
    width: auto;
  }

  .menu-item {
    padding: 9px 16px;
    font-size: 14px;
  }

  .item-content {
    gap: 6px;
  }

  .liquid-menu.is-compact .compact-trigger {
    display: none;
  }

  .menu-shell.has-compact-toggle .menu-list {
    padding-right: 6px;
  }

  .liquid-menu.is-compact .menu-list,
  .liquid-menu.is-compact .active-bubble {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }
}

@media (max-width: 640px) {
  .menu-list {
    padding: 4px;
  }

  .menu-item {
    padding: 8px 10px;
    font-size: 12px;
  }

  .item-icon {
    display: none;
  }

  .item-text {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .menu-item {
    padding: 8px 8px;
    font-size: 11px;
  }
}
</style>
