<script setup lang="ts">
import LiquidMenu from './components/LiquidMenu.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class="mesh-bg">
    <div class="mesh-orb mesh-orb-1"></div>
    <div class="mesh-orb mesh-orb-2"></div>
    <div class="mesh-orb mesh-orb-3"></div>
  </div>
  
  <svg class="noise-overlay" viewBox="0 0 100% 100%" xmlns="http://www.w3.org/2000/svg">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>

  <RouterView />
  <AppFooter />

  <!-- LiquidMenu fixed at bottom center, above all content -->
  <div class="liquid-menu-wrapper">
    <LiquidMenu />
  </div>
</template>

<style scoped>
.liquid-menu-wrapper {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
}
</style>
