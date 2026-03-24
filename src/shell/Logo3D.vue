<script setup lang="ts">
import { ref } from 'vue'
import { useLogoThreeScene } from '../composables/useLogoThreeScene'

const props = defineProps<{
  text?: string
}>()

const container = ref<HTMLElement | null>(null)
useLogoThreeScene(container, props.text)
</script>

<template>
  <div ref="container" class="logo-3d bg-transparent pointer-events-none"></div>
</template>

<style scoped>
.logo-3d {
  width: 100%;
  height: 100%;
  min-width: 108px;
  min-height: 42px;
  contain: paint;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.logo-3d :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>

