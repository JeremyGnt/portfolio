<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '../shell/AppShell.vue'
import LoadingScreen from '../shell/LoadingScreen.vue'
import { MOBILE_BREAKPOINT } from '../constants/responsive'
import { scrollWindowToTopInstantly, waitForNextAnimationFrame } from '../utils/scroll'

const fullRotation = Math.PI * 2
const routeOrder = ['/', '/experience', '/projects', '/contact']
const topNavigationThreshold = 24
const hasPrerenderedMarkup =
  !import.meta.env.SSR
  && typeof document !== 'undefined'
  && Boolean(document.getElementById('app')?.firstElementChild)
const useShellTransition = !import.meta.env.SSR && !hasPrerenderedMarkup

const showScrollTop = ref(false)
const isScrollTopClicked = ref(false)
const isShellReady = ref(import.meta.env.SSR || hasPrerenderedMarkup)
const isLoadingScreenVisible = ref(!import.meta.env.SSR && !hasPrerenderedMarkup)
const isBootLoaderVisible = ref(!import.meta.env.SSR)
const scrollProgress = ref(0)
const isMiniScrollbarVisible = ref(false)
const route = useRoute()
const router = useRouter()
type HeaderLogoRouteSpinDetail = {
  direction: 1 | -1
  fromPath: string
  sequence: number
  startAngle: number
  targetAngle: number
  toPath: string
}

type HeaderLogoRouteSpinWindow = Window & {
  __headerLogoRouteSpin?: HeaderLogoRouteSpinDetail
}

let scrollTopClickTimeout: number | null = null
let miniScrollbarTimeout: number | null = null
let homeScrollResetToken = 0
let headerLogoRouteAngle = 0
let headerLogoSpinSequence = 0

function getRouteIndex(path: string) {
  const index = routeOrder.indexOf(path)
  return index === -1 ? 0 : index
}

function isDesktopHomeAnchoringActive(path: string) {
  if (typeof document === 'undefined' || path !== '/' || window.innerWidth < MOBILE_BREAKPOINT) {
    return false
  }

  return Boolean(document.getElementById('target-j') && document.getElementById('target-g'))
}

function dismissBootLoader() {
  if (typeof document === 'undefined') {
    return
  }

  document.getElementById('boot-loader')?.remove()
  isBootLoaderVisible.value = false
}

function goToHomeFromHeaderLogo() {
  if (route.path !== '/') {
    router.push('/')
  }
}

async function handleLoaderComplete() {
  isLoadingScreenVisible.value = false
  isShellReady.value = true

  await nextTick()
  updateScrollTopVisibility()
  setHeaderLogoVisibility(route.path)
}

function setHeaderLogoVisibility(path: string) {
  const logoJ = document.getElementById('logo-j')
  const logoG = document.getElementById('logo-g')
  const logoBg = document.getElementById('header-logo-bg')
  if (!logoJ || !logoG || !logoBg) return

  if (isDesktopHomeAnchoringActive(path)) {
    return
  }

  const showLogo = path !== '/' || window.innerWidth < MOBILE_BREAKPOINT
  const opacity = showLogo ? 1 : 0
  const visibility = showLogo ? 'visible' : 'hidden'
  logoJ.style.opacity = String(opacity)
  logoG.style.opacity = String(opacity)
  logoJ.style.visibility = visibility
  logoG.style.visibility = visibility
  logoBg.style.opacity = String(opacity)
}

function updateScrollTopVisibility() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const viewportHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const maxScrollable = Math.max(documentHeight - viewportHeight, 0)
  const remainingDistance = documentHeight - (scrollTop + viewportHeight)

  showScrollTop.value = scrollTop > 240 && remainingDistance <= Math.max(320, viewportHeight * 0.35)
  scrollProgress.value = maxScrollable > 0 ? Math.min(Math.max(scrollTop / maxScrollable, 0), 1) : 0
}

function showMiniScrollbarWhileScrolling() {
  isMiniScrollbarVisible.value = true

  if (miniScrollbarTimeout !== null) {
    globalThis.clearTimeout(miniScrollbarTimeout)
  }

  miniScrollbarTimeout = globalThis.setTimeout(() => {
    isMiniScrollbarVisible.value = false
    miniScrollbarTimeout = null
  }, 650)
}

function handleWindowScroll() {
  updateScrollTopVisibility()
  showMiniScrollbarWhileScrolling()
}

function handleWindowResize() {
  updateScrollTopVisibility()
  setHeaderLogoVisibility(route.path)
}

function getHeaderLogoRouteStartAngle(path: string, fallbackAngle: number) {
  if (typeof window === 'undefined' || path !== '/' || window.innerWidth < MOBILE_BREAKPOINT) {
    return fallbackAngle
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
  const progress = maxScroll === 0 ? 1 : Math.min(Math.max(scrollTop / maxScroll, 0), 1)

  return progress * fullRotation
}

function dispatchHeaderLogoRouteSpin(fromPath: string | undefined, toPath: string) {
  if (typeof window === 'undefined' || !fromPath || fromPath === toPath) {
    return
  }

  const fromIndex = getRouteIndex(fromPath)
  const toIndex = getRouteIndex(toPath)
  const isMobileViewport = window.innerWidth < MOBILE_BREAKPOINT
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const wasNearTop = scrollTop <= topNavigationThreshold

  if (fromIndex === toIndex) {
    return
  }

  const shouldAnimateRouteTransition = isMobileViewport || wasNearTop || fromPath === '/'

  if (!shouldAnimateRouteTransition) {
    if (!isMobileViewport) {
      headerLogoRouteAngle = 0
    }
    return
  }

  if (!isMobileViewport && toPath === '/') {
    headerLogoRouteAngle = 0
    return
  }

  const direction = toIndex > fromIndex ? 1 : -1
  const startAngle = getHeaderLogoRouteStartAngle(fromPath, headerLogoRouteAngle)
  const targetAngle = startAngle + direction * fullRotation

  headerLogoRouteAngle = targetAngle
  headerLogoSpinSequence += 1

  const detail: HeaderLogoRouteSpinDetail = {
    direction,
    fromPath,
    sequence: headerLogoSpinSequence,
    startAngle,
    targetAngle,
    toPath,
  }

  ;(window as HeaderLogoRouteSpinWindow).__headerLogoRouteSpin = detail
  window.dispatchEvent(new CustomEvent<HeaderLogoRouteSpinDetail>('header-logo-route-spin', { detail }))
}

function scrollToTop() {
  if (scrollTopClickTimeout !== null) {
    globalThis.clearTimeout(scrollTopClickTimeout)
  }

  isScrollTopClicked.value = true
  scrollTopClickTimeout = globalThis.setTimeout(() => {
    isScrollTopClicked.value = false
    scrollTopClickTimeout = null
  }, 420)

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollTopVisibility()
  setHeaderLogoVisibility(route.path)
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  window.addEventListener('resize', handleWindowResize)

  if (hasPrerenderedMarkup) {
    isLoadingScreenVisible.value = true
    return
  }

  if (!isLoadingScreenVisible.value) {
    dismissBootLoader()
  }
})

watch(
  () => route.path,
  async (path, previousPath) => {
    dispatchHeaderLogoRouteSpin(previousPath, path)
    setHeaderLogoVisibility(path)

    if (path !== '/') {
      return
    }

    const currentToken = ++homeScrollResetToken

    await nextTick()
    await waitForNextAnimationFrame()
    await waitForNextAnimationFrame()

    if (currentToken !== homeScrollResetToken || route.path !== '/') {
      return
    }

    scrollWindowToTopInstantly()
    updateScrollTopVisibility()
  },
)

watch(
  () => isBootLoaderVisible.value || isLoadingScreenVisible.value || !isShellReady.value,
  (isIntroBlocking) => {
    if (typeof document === 'undefined') {
      return
    }

    document.body.style.overflow = isIntroBlocking ? 'hidden' : ''
  },
  { immediate: true },
)

onUnmounted(() => {
  if (scrollTopClickTimeout !== null) {
    globalThis.clearTimeout(scrollTopClickTimeout)
  }

  if (miniScrollbarTimeout !== null) {
    globalThis.clearTimeout(miniScrollbarTimeout)
  }

  document.body.style.overflow = ''

  window.removeEventListener('scroll', handleWindowScroll)
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<template>
  <div class="app-background" aria-hidden="true">
    <div class="mesh-bg"></div>
  </div>

  <LoadingScreen
    v-if="isLoadingScreenVisible"
    @ready="dismissBootLoader"
    @complete="handleLoaderComplete"
  />

  <Transition v-if="useShellTransition" name="page-fade" appear>
    <AppShell
      v-if="isShellReady"
      :is-mini-scrollbar-visible="isMiniScrollbarVisible"
      :is-scroll-top-clicked="isScrollTopClicked"
      :scroll-progress="scrollProgress"
      :show-scroll-top="showScrollTop"
      @go-home="goToHomeFromHeaderLogo"
      @scroll-top="scrollToTop"
    />
  </Transition>

  <AppShell
    v-else-if="isShellReady"
    :is-mini-scrollbar-visible="isMiniScrollbarVisible"
    :is-scroll-top-clicked="isScrollTopClicked"
    :scroll-progress="scrollProgress"
    :show-scroll-top="showScrollTop"
    @go-home="goToHomeFromHeaderLogo"
    @scroll-top="scrollToTop"
  />
</template>

<style scoped>
.app-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.page-fade-enter-active {
  transition: opacity 0.9s ease;
}

.page-fade-enter-from {
  opacity: 0;
}

.page-fade-enter-to {
  opacity: 1;
}
</style>
