<script setup lang="ts">
import gsap from 'gsap'
import { Ellipsis } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNavigationIndexByPath, navigationItems } from '../constants/navigation'

type CompactMenuEvent = CustomEvent<{ compact?: boolean }>
type ItemMetric = {
  left: number
  top: number
  width: number
  height: number
  center: number
}

const route = useRoute()
const router = useRouter()
const compactSize = 58
const menuShellExpandDurationMs = 520
const mobileBreakpoint = 768

const items = navigationItems

function getActiveIndexFromRoute() {
  return getNavigationIndexByPath(route.path)
}

const menuRootRef = ref<HTMLElement | null>(null)
const menuShellRef = ref<HTMLElement | null>(null)
const menuTrackRef = ref<HTMLElement | null>(null)
const bubbleRef = ref<HTMLElement | null>(null)
const itemRefs = ref<HTMLElement[]>([])
const activeIndex = ref(getActiveIndexFromRoute())
const dragIndex = ref(activeIndex.value)
const isMoving = ref(false)
const isGrowing = ref(false)
const isDraggingBubble = ref(false)
const moveDuration = ref(0.8)
const growDuration = ref(0.46)
const bubbleStyle = ref({ width: '0px', height: '0px', left: '0px', top: '0px' })
const isBubbleTransitionSuppressed = ref(true)
const isCompactMode = ref(false)
const isMenuContentVisible = ref(true)
const expandedWidth = ref(0)

const bubbleInlineStyle = computed(() => ({
  ...bubbleStyle.value,
  '--move-duration': isBubbleTransitionSuppressed.value ? '0s' : `${moveDuration.value}s`,
  '--grow-duration': `${growDuration.value}s`,
}))
const highlightedIndex = computed(() => (isDraggingBubble.value ? dragIndex.value : activeIndex.value))
const bubbleStateClasses = computed(() => ({
  moving: isMoving.value || isDraggingBubble.value,
  growing: isGrowing.value || isDraggingBubble.value,
  dragging: isDraggingBubble.value,
}))

const menuShellStyle = computed(() => ({
  '--compact-size': `${compactSize}px`,
  '--menu-shell-width': expandedWidth.value > 0 ? `${expandedWidth.value}px` : 'max-content',
}))

let moveTimeout: ReturnType<typeof setTimeout> | null = null
let growTimeout: ReturnType<typeof setTimeout> | null = null
let compactSyncTimeout: ReturnType<typeof setTimeout> | null = null
let menuContentRevealTimeout: ReturnType<typeof setTimeout> | null = null
let bubbleTransitionRestoreFrame: number | null = null
let bubbleTransitionRestoreNestedFrame: number | null = null
let activePointerId: number | null = null
let pendingPointerId: number | null = null
let pendingPointerStartX = 0
let pendingPointerStartY = 0

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

const isMobileViewport = () => window.innerWidth <= mobileBreakpoint

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const dragStartThreshold = 8

const getItemMetrics = () => {
  const parent = menuTrackRef.value
  if (!parent) {
    return null
  }

  const parentRect = parent.getBoundingClientRect()
  const metrics = itemRefs.value
    .filter(Boolean)
    .map((item) => {
      const itemRect = item.getBoundingClientRect()
      const left = itemRect.left - parentRect.left

      return {
        left,
        top: itemRect.top - parentRect.top,
        width: itemRect.width,
        height: itemRect.height,
        center: left + itemRect.width / 2,
      }
    })

  if (metrics.length === 0) {
    return null
  }

  return { parentRect, metrics }
}

const getIndexFromClientX = (clientX: number, parentRect: DOMRect, metrics: ItemMetric[]) => {
  const relativeX = clientX - parentRect.left
  const insideIndex = metrics.findIndex((metric) => relativeX >= metric.left && relativeX <= metric.left + metric.width)

  if (insideIndex !== -1) {
    return insideIndex
  }

  return metrics.reduce((closestIndex, metric, index) => {
    const currentDistance = Math.abs(metric.center - relativeX)
    const bestDistance = Math.abs(metrics[closestIndex].center - relativeX)
    return currentDistance < bestDistance ? index : closestIndex
  }, 0)
}

const updateBubbleDuringDrag = (clientX: number) => {
  const layout = getItemMetrics()
  if (!layout) {
    return
  }

  const { parentRect, metrics } = layout
  const nextIndex = getIndexFromClientX(clientX, parentRect, metrics)
  const metric = metrics[nextIndex]
  const draggedLeft = clamp(
    clientX - parentRect.left - metric.width / 2,
    0,
    Math.max(parentRect.width - metric.width, 0),
  )

  dragIndex.value = nextIndex
  bubbleStyle.value = {
    width: `${metric.width}px`,
    height: `${metric.height}px`,
    left: `${draggedLeft}px`,
    top: `${metric.top}px`,
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

const clearMenuContentRevealTimeout = () => {
  if (menuContentRevealTimeout) {
    clearTimeout(menuContentRevealTimeout)
    menuContentRevealTimeout = null
  }
}

const revealMenuContentAfterExpand = () => {
  clearMenuContentRevealTimeout()
  menuContentRevealTimeout = setTimeout(() => {
    if (!isCompactMode.value) {
      isMenuContentVisible.value = true
    }
    menuContentRevealTimeout = null
  }, menuShellExpandDurationMs + 40)
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
  dragIndex.value = index

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

const handlePointerDown = (event: PointerEvent) => {
  if (!isMobileViewport() || isCompactMode.value) {
    return
  }

  if (event.pointerType === 'mouse' && event.button !== 0) {
    return
  }

  if (!menuTrackRef.value || !getItemMetrics()) {
    return
  }

  pendingPointerId = event.pointerId
  pendingPointerStartX = event.clientX
  pendingPointerStartY = event.clientY
}

const handlePointerMove = (event: PointerEvent) => {
  if (isDraggingBubble.value && activePointerId === event.pointerId) {
    updateBubbleDuringDrag(event.clientX)
    event.preventDefault()
    return
  }

  if (pendingPointerId !== event.pointerId) {
    return
  }

  const movedX = event.clientX - pendingPointerStartX
  const movedY = event.clientY - pendingPointerStartY
  const distance = Math.hypot(movedX, movedY)

  if (distance < dragStartThreshold) {
    return
  }

  if (!menuTrackRef.value) {
    return
  }

  pendingPointerId = null
  activePointerId = event.pointerId
  isDraggingBubble.value = true
  dragIndex.value = activeIndex.value
  isBubbleTransitionSuppressed.value = true
  menuTrackRef.value.setPointerCapture(event.pointerId)
  gsap.killTweensOf(bubbleRef.value)
  updateBubbleDuringDrag(event.clientX)
  event.preventDefault()
}

const finishBubbleDrag = (event: PointerEvent) => {
  if (pendingPointerId === event.pointerId) {
    pendingPointerId = null
    return
  }

  if (!isDraggingBubble.value || activePointerId !== event.pointerId) {
    return
  }

  if (menuTrackRef.value?.hasPointerCapture(event.pointerId)) {
    menuTrackRef.value.releasePointerCapture(event.pointerId)
  }

  isDraggingBubble.value = false
  activePointerId = null
  restoreBubbleTransitions()
  selectItem(dragIndex.value)
  event.preventDefault()
}

const cancelBubbleDrag = (event: PointerEvent) => {
  if (pendingPointerId === event.pointerId) {
    pendingPointerId = null
    return
  }

  if (!isDraggingBubble.value || activePointerId !== event.pointerId) {
    return
  }

  if (menuTrackRef.value?.hasPointerCapture(event.pointerId)) {
    menuTrackRef.value.releasePointerCapture(event.pointerId)
  }

  isDraggingBubble.value = false
  activePointerId = null
  dragIndex.value = activeIndex.value
  syncMenuLayout(true)
}

const handleCompactModeChange = (event: Event) => {
  const compact = Boolean((event as CompactMenuEvent).detail?.compact)
  const wasCompact = isCompactMode.value

  clearMenuContentRevealTimeout()

  if (compact) {
    isMenuContentVisible.value = false
  }
  else if (!wasCompact) {
    isMenuContentVisible.value = true
  }

  isCompactMode.value = compact

  if (!compact && wasCompact) {
    revealMenuContentAfterExpand()
  }

  scheduleMenuLayoutSync()
}

const handleMenuShellTransitionEnd = (event: TransitionEvent) => {
  if (event.propertyName === 'width') {
    if (!isCompactMode.value) {
      clearMenuContentRevealTimeout()
      isMenuContentVisible.value = true
    }
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
  isMenuContentVisible.value = !isCompactMode.value

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

  clearMenuContentRevealTimeout()

  cancelBubbleTransitionRestore()
})
</script>

<template>
  <nav
    ref="menuRootRef"
    class="liquid-menu"
    :style="menuShellStyle"
    :class="{
      'is-content-visible': isMenuContentVisible,
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
        <div
          ref="menuTrackRef"
          class="menu-shell-track"
          @pointerdown="handlePointerDown"
          @pointermove="handlePointerMove"
          @pointerup="finishBubbleDrag"
          @pointercancel="cancelBubbleDrag"
        >
          <ul class="menu-list" :aria-hidden="isCompactMode || !isMenuContentVisible">
            <li
              v-for="(item, index) in items"
              :key="item.path"
              :ref="(el) => setItemRef(el, index)"
              class="menu-item"
              :class="{ active: highlightedIndex === index }"
              @click="selectItem(index)"
            >
              <div class="item-content">
                <span class="item-icon">
                  <component :is="item.icon" :size="18" :stroke-width="2" />
                </span>
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
        ref="bubbleRef"
        class="active-bubble"
        :class="bubbleStateClasses"
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
  --menu-shell-expand-duration: 0.52s;
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
    width var(--menu-shell-expand-duration) linear,
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
    transform var(--menu-shell-expand-duration) linear;
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

.liquid-menu:not(.is-content-visible) .menu-list {
  opacity: 0;
  pointer-events: none;
  transform: none;
}

.liquid-menu:not(.is-content-visible) .active-bubble {
  opacity: 0;
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

.active-bubble.dragging {
  transform: scale(1.28);
  backdrop-filter: brightness(1.2) blur(1px) url(#menuDisplacementFilter);
  background-color: rgba(255, 255, 255, 0.03);
  box-shadow:
    inset 1px 1px 1px 0 rgba(255, 255, 255, 0.42),
    inset -1px -1px 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 10px 1px rgba(255, 255, 255, 0.18),
    0 10px 28px rgba(0, 0, 0, 0.14);
}

@media (max-width: 768px) {
  .liquid-menu {
    --compact-size: 74px;
    width: 100%;
  }

  .menu-shell,
  .liquid-menu.is-compact .menu-shell {
    width: 100%;
    max-width: 100%;
  }

  .menu-shell-track {
    width: 100%;
    touch-action: none;
  }

  .menu-list {
    width: 100%;
    padding: 5px;
  }

  .menu-item {
    flex: 1 1 0;
    min-height: calc(var(--compact-size) - 10px);
    padding: 10px 12px;
    font-size: 12px;
  }

  .item-content {
    flex-direction: column;
    gap: 4px;
    min-width: 54px;
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

  .liquid-menu:not(.is-content-visible) .menu-list {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }

  .item-icon {
    width: 18px;
    height: 18px;
  }

  .item-text {
    white-space: nowrap;
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
  }
}

@media (max-width: 480px) {
  .menu-item {
    padding: 9px 8px;
  }

  .item-content {
    min-width: 48px;
  }

  .item-text {
    font-size: 9px;
  }
}
</style>
