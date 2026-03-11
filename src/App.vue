<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ChevronUp } from 'lucide-vue-next'
import LiquidMenu from './components/LiquidMenu.vue'
import AppFooter from './components/AppFooter.vue'
import Logo3D from './components/Logo3D.vue'

const showScrollTop = ref(false)
const isScrollTopClicked = ref(false)
let scrollTopClickTimeout: number | null = null

function updateScrollTopVisibility() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const viewportHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const remainingDistance = documentHeight - (scrollTop + viewportHeight)

  showScrollTop.value = scrollTop > 240 && remainingDistance <= Math.max(320, viewportHeight * 0.35)
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
  window.addEventListener('scroll', updateScrollTopVisibility, { passive: true })
  window.addEventListener('resize', updateScrollTopVisibility)
})

onUnmounted(() => {
  if (scrollTopClickTimeout !== null) {
    globalThis.clearTimeout(scrollTopClickTimeout)
  }

  window.removeEventListener('scroll', updateScrollTopVisibility)
  window.removeEventListener('resize', updateScrollTopVisibility)
})
</script>

<template>
  <div class="mesh-bg"></div>
  
  <svg class="noise-overlay" viewBox="0 0 100% 100%" xmlns="http://www.w3.org/2000/svg">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>

  <header class="app-header">
    <div class="header-logo">
      <div class="header-logo-card">
        <div id="header-logo-bg"></div>
        <div id="logo-j" class="logo-wrapper"><Logo3D text="J" /></div>
        <div id="logo-g" class="logo-wrapper"><Logo3D text="G" /></div>
      </div>
    </div>

    <div class="header-menu">
      <LiquidMenu />
    </div>
  </header>

  <main class="app-shell">
    <RouterView />
  </main>

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
</template>

<style scoped>
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
}
</style>
