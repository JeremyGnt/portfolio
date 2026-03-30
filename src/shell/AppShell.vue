<script setup lang="ts">
import { ChevronUp } from 'lucide-vue-next'
import LiquidMenu from './LiquidMenu.vue'
import AppFooter from './AppFooter.vue'
import Logo3D from './Logo3D.vue'

defineProps<{
  isMiniScrollbarVisible: boolean
  isScrollTopClicked: boolean
  scrollProgress: number
  showScrollTop: boolean
}>()

const emit = defineEmits<{
  goHome: []
  scrollTop: []
}>()
</script>

<template>
  <div class="app-ready-shell">
    <header class="app-header">
      <div class="header-logo">
        <button
          class="header-logo-card"
          type="button"
          aria-label="Retourner a la page d'accueil"
          @click="emit('goHome')"
        >
          <div id="header-logo-bg"></div>
          <div
            id="logo-j"
            class="logo-wrapper opacity-0 bg-transparent pointer-events-none"
            style="visibility: hidden; opacity: 0; background-color: transparent; pointer-events: none;"
          >
            <Logo3D text="J" />
          </div>
          <div
            id="logo-g"
            class="logo-wrapper opacity-0 bg-transparent pointer-events-none"
            style="visibility: hidden; opacity: 0; background-color: transparent; pointer-events: none;"
          >
            <Logo3D text="G" />
          </div>
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

    <button
      :class="[
        'scroll-top-button',
        {
          'is-clicked': isScrollTopClicked,
          'is-visible': showScrollTop,
        },
      ]"
      type="button"
      aria-label="Remonter en haut de la page"
      :aria-hidden="!showScrollTop"
      :tabindex="showScrollTop ? 0 : -1"
      @click="emit('scrollTop')"
    >
      <ChevronUp :size="24" />
    </button>

    <AppFooter />
  </div>
</template>

<style scoped>
.app-ready-shell {
  position: relative;
  z-index: 2;
}

.app-header {
  --header-pill-height: 58px;
  --header-logo-content-height: clamp(42px, 4.2vw, 52px);
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
  transition:
    gap 0.3s ease,
    padding 0.3s ease;
}

.header-logo,
.header-menu {
  pointer-events: auto;
}

.header-logo {
  flex: 0 0 auto;
  width: clamp(108px, 11vw, 148px);
  height: var(--header-pill-height);
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
  height: min(100%, var(--header-logo-content-height));
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
  -webkit-backdrop-filter: brightness(1.2) blur(1px);
  isolation: isolate;
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow:
    inset 1px 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset -1px -1px 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 8px 1px rgba(255, 255, 255, 0.15),
    0 10px 40px rgba(0, 0, 0, 0.8);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(10px) scale(0.92);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background-color 0.25s ease,
    opacity 0.25s ease,
    visibility 0s linear 0.25s;
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

.scroll-top-button.is-visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0) scale(1);
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    background-color 0.25s ease,
    opacity 0.32s ease,
    visibility 0s linear 0s;
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

@media (max-width: 1023px) {
  .app-ready-shell {
    padding-bottom: calc(5.6rem + env(safe-area-inset-bottom));
  }

  .app-header {
    --header-pill-height: 46px;
    top: 1rem;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0;
    padding: 0 1rem;
  }

  .header-logo {
    width: 85px;
    height: 46px;
    margin-right: 0;
    align-self: flex-start;
  }

  #logo-j {
    transform: translateX(26px);
  }

  #logo-g {
    transform: translateX(-26px);
  }

  .header-menu {
    position: fixed;
    left: 1rem;
    right: 1rem;
    bottom: calc(0.35rem + env(safe-area-inset-bottom));
    z-index: 9100;
    justify-content: stretch;
  }

  .app-shell {
    padding-top: 0;
  }

  .scroll-top-button {
    right: 1rem;
    bottom: calc(7.1rem + env(safe-area-inset-bottom));
    width: 52px;
    height: 52px;
    background-color: rgba(15, 15, 15, 0.24);
    backdrop-filter: blur(14px) saturate(1.08);
    -webkit-backdrop-filter: blur(14px) saturate(1.08);
  }

  .mini-scrollbar {
    display: none;
  }
}
</style>
