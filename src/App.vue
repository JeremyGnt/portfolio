<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronUp } from 'lucide-vue-next'
import LiquidMenu from './components/LiquidMenu.vue'
import AppFooter from './components/AppFooter.vue'
import Logo3D from './components/Logo3D.vue'
import LoadingScreen from './components/LoadingScreen.vue'

const showScrollTop = ref(false)
const isScrollTopClicked = ref(false)
const isAppReady = ref(false)
const scrollProgress = ref(0)
const isMiniScrollbarVisible = ref(false)
const route = useRoute()
const router = useRouter()
let scrollTopClickTimeout: number | null = null
let miniScrollbarTimeout: number | null = null

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
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  window.addEventListener('resize', updateScrollTopVisibility)
})

watch(
  () => route.path,
  (path) => {
    setHeaderLogoVisibility(path)
  },
)

watch(
  isAppReady,
  (ready) => {
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
  window.removeEventListener('resize', updateScrollTopVisibility)
})
</script>

<template>
  <div class="app-background" aria-hidden="true">
    <div class="mesh-bg"></div>

    <svg class="noise-overlay" viewBox="0 0 100% 100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>

  <LoadingScreen v-if="!isAppReady" @complete="handleLoaderComplete" />

  <Transition name="page-fade" appear>
    <div v-if="isAppReady" class="app-ready-shell">
    <header class="app-header">
      <div class="header-logo">
        <button
          class="header-logo-card"
          type="button"
          aria-label="Retourner a la page d'accueil"
          @click="goToHomeFromHeaderLogo"
        >
          <div id="header-logo-bg"></div>
          <div id="logo-j" class="logo-wrapper opacity-0 bg-transparent pointer-events-none" style="visibility: hidden; opacity: 0; background-color: transparent; pointer-events: none;"><Logo3D text="J" /></div>
          <div id="logo-g" class="logo-wrapper opacity-0 bg-transparent pointer-events-none" style="visibility: hidden; opacity: 0; background-color: transparent; pointer-events: none;"><Logo3D text="G" /></div>
        </button>
      </div>

      <div class="header-menu">
        <LiquidMenu />
      </div>
    </header>

    <main class="app-shell">
      <RouterView />
    </main>

    <div class="mini-scrollbar" :class="{ 'is-visible': isMiniScrollbarVisible }" aria-hidden="true">
      <div class="mini-scrollbar__thumb" :style="{ transform: `translateY(${scrollProgress * 120}px)` }" />
    </div>

    <Transition name="scroll-top-fade">
      <button
        v-if="showScrollTop"
        :class="['scroll-top-button', { 'is-clicked': isScrollTopClicked }]"
        type="button"
        aria-label="Remonter en haut de la page"
        @click="scrollToTop"
      >
        <ChevronUp :size="24" />
      </button>
    </Transition>

    <AppFooter />
    </div>
  </Transition>
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

.app-ready-shell {
  position: relative;
  z-index: 2;
}

.app-header {
  position: fixed;
  top: 1.5rem;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0 2rem;
  z-index: 9999;
  pointer-events: none;
}

.header-logo,
.header-menu {
  pointer-events: auto;
}

.header-logo {
  flex: 0 0 auto;
  width: clamp(108px, 11vw, 148px);
  height: clamp(42px, 4.2vw, 52px);
  margin-right: 3rem;
}

.header-logo-card {
  width: 100%;
  height: 100%;
  border-radius: 40px;
  position: relative;
  padding: 0.15rem 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation !important;
}

#header-logo-bg {
  position: absolute;
  inset: 0;
  border-radius: 40px;
  background-color: rgba(15, 15, 15, 0.1);
  backdrop-filter: brightness(1.2) blur(1px) url(#menuDisplacementFilter);
  box-shadow:
    inset 1px 1px 1px 0px rgba(255, 255, 255, 0.4),
    inset -1px -1px 2px 0px rgba(0, 0, 0, 0.1),
    inset 0 0 8px 1px rgba(255, 255, 255, 0.15),
    0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 10;
  pointer-events: none;
}

.logo-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
  position: relative;
  z-index: 50;
  margin: 0 -14px;
  opacity: 0;
}

#logo-j {
  transform: translateX(20px);
}

#logo-g {
  transform: translateX(-20px);
}

.header-menu {
  display: flex;
  flex: 1 1 auto;
  justify-content: flex-end;
  min-width: 0;
}

.app-shell {
  position: relative;
  z-index: 1;
  padding-top: 0;
}

.mini-scrollbar {
  position: fixed;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 4px;
  height: 160px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 9050;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mini-scrollbar.is-visible {
  opacity: 1;
}

.mini-scrollbar__thumb {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.18);
  will-change: transform;
}

.scroll-top-button {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  width: 58px;
  height: 58px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  z-index: 9000;
  overflow: hidden;
  background-color: rgba(15, 15, 15, 0.1);
  backdrop-filter: brightness(1.2) blur(1px) url(#menuDisplacementFilter);
  box-shadow:
    inset 1px 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset -1px -1px 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 8px 1px rgba(255, 255, 255, 0.15),
    0 10px 40px rgba(0, 0, 0, 0.8);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background-color 0.25s ease,
    opacity 0.25s ease;
}

.scroll-top-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 68%);
  opacity: 0;
  transform: scale(0.6);
  pointer-events: none;
}

.scroll-top-fade-enter-active,
.scroll-top-fade-leave-active {
  transition:
    opacity 0.32s ease,
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-top-fade-enter-from,
.scroll-top-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.92);
}

.scroll-top-fade-enter-to,
.scroll-top-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.scroll-top-button:hover {
  transform: translateY(-2px) scale(1.03);
  background-color: rgba(20, 20, 20, 0.16);
}

.scroll-top-button:active {
  transform: scale(0.94);
}

.scroll-top-button.is-clicked {
  animation: scroll-top-press 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-top-button.is-clicked::after {
  animation: scroll-top-ripple 0.42s ease-out;
}

.scroll-top-button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.55);
  outline-offset: 3px;
}

@keyframes scroll-top-press {
  0% {
    transform: scale(1);
  }

  35% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes scroll-top-ripple {
  0% {
    opacity: 0;
    transform: scale(0.45);
  }

  30% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: scale(1.35);
  }
}

@media (max-width: 900px) {
  .app-header {
    top: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 0 1rem;
  }

  .header-logo {
    width: 120px;
    height: 46px;
    align-self: center;
  }

  .header-menu {
    justify-content: center;
  }

  .app-shell {
    padding-top: 0;
  }

  .scroll-top-button {
    right: 1rem;
    bottom: 1rem;
    width: 52px;
    height: 52px;
  }

  .mini-scrollbar {
    display: none;
  }
}
</style>
