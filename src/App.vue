<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingScreen from './components/LoadingScreen.vue'
import AppShell from './components/AppShell.vue'
import { scrollWindowToTopInstantly, waitForNextAnimationFrame } from './utils/scroll'

const hasPrerenderedMarkup =
  !import.meta.env.SSR
  && typeof document !== 'undefined'
  && Boolean(document.getElementById('app')?.firstElementChild)
const useShellTransition = !import.meta.env.SSR && !hasPrerenderedMarkup

const showScrollTop = ref(false)
const isScrollTopClicked = ref(false)
const isAppReady = ref(import.meta.env.SSR || hasPrerenderedMarkup)
const scrollProgress = ref(0)
const isMiniScrollbarVisible = ref(false)
const route = useRoute()
const router = useRouter()
let scrollTopClickTimeout: number | null = null
let miniScrollbarTimeout: number | null = null
let homeScrollResetToken = 0

function goToHomeFromHeaderLogo() {
  if (route.path !== '/') {
    router.push('/')
  }
}

async function handleLoaderComplete() {
  isAppReady.value = true

  await nextTick()
  updateScrollTopVisibility()
  setHeaderLogoVisibility(route.path)
}

function setHeaderLogoVisibility(path: string) {
  const logoJ = document.getElementById('logo-j')
  const logoG = document.getElementById('logo-g')
  const logoBg = document.getElementById('header-logo-bg')
  if (!logoJ || !logoG || !logoBg) return

  const opacity = path === '/' ? 0 : 1
  const visibility = path === '/' ? 'hidden' : 'visible'
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
})

watch(
  () => route.path,
  async (path) => {
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
  isAppReady,
  (ready) => {
    if (typeof document === 'undefined') {
      return
    }

    document.body.style.overflow = ready ? '' : 'hidden'
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

  <LoadingScreen v-if="!isAppReady" @complete="handleLoaderComplete" />

  <Transition v-if="useShellTransition" name="page-fade" appear>
    <AppShell
      v-if="isAppReady"
      :is-mini-scrollbar-visible="isMiniScrollbarVisible"
      :is-scroll-top-clicked="isScrollTopClicked"
      :scroll-progress="scrollProgress"
      :show-scroll-top="showScrollTop"
      @go-home="goToHomeFromHeaderLogo"
      @scroll-top="scrollToTop"
    />
  </Transition>

  <AppShell
    v-else-if="isAppReady"
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
