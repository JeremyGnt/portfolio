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
  <div ref="container" class="logo-3d"></div>
</template>

<style scoped>
.logo-3d {
  width: 100%;
  height: 100%;
  min-width: 108px;
  min-height: 42px;
}
</style>

