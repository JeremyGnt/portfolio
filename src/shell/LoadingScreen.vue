<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits<{
  ready: []
  complete: []
}>()

const progress = ref(0)
const isBarHidden = ref(false)
const isFadingOut = ref(false)

let startTimeout: number | null = null
let tickTimeout: number | null = null
let fadeTimeout: number | null = null
let completeTimeout: number | null = null

function clearTimer(timer: number | null) {
  if (timer !== null) {
    globalThis.clearTimeout(timer)
  }
}

function simulateLoading() {
  if (progress.value < 100) {
    const jump = Math.floor(Math.random() * 12) + 1
    progress.value += jump

    if (progress.value > 100) {
      progress.value = 100
    }

    const nextTick = Math.random() * 150 + 50
    tickTimeout = globalThis.setTimeout(simulateLoading, nextTick)
    return
  }

  isBarHidden.value = true

  fadeTimeout = globalThis.setTimeout(() => {
    isFadingOut.value = true
  }, 200)

  completeTimeout = globalThis.setTimeout(() => {
    emit('complete')
  }, 1000)
}

onMounted(() => {
  emit('ready')
  startTimeout = globalThis.setTimeout(simulateLoading, 300)
})

onUnmounted(() => {
  clearTimer(startTimeout)
  clearTimer(tickTimeout)
  clearTimer(fadeTimeout)
  clearTimer(completeTimeout)
})
</script>

<template>
  <output
    :class="['loader-container', { 'fade-out': isFadingOut }]"
    aria-live="polite"
    aria-label="Chargement du portfolio"
  >
    <div class="logo">JG<span class="logo-dot">.</span></div>

    <div :class="['progress-track', { hide: isBarHidden }]" aria-hidden="true">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
  </output>
</template>

<style scoped>
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 20000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  isolation: isolate;
  background:
    radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.045), transparent 18%),
    radial-gradient(circle at 78% 14%, rgba(255, 255, 255, 0.03), transparent 16%),
    radial-gradient(circle at 58% 70%, rgba(255, 255, 255, 0.035), transparent 22%),
    linear-gradient(180deg, #000 0%, #111 100%);
  overflow: hidden;
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.loader-container::before,
.loader-container::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.loader-container::before {
  opacity: 0.16;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 140px 140px;
  mask-image: radial-gradient(circle at center, black 34%, transparent 88%);
  -webkit-mask-image: radial-gradient(circle at center, black 34%, transparent 88%);
}

.loader-container::after {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.24) 100%);
}

.loader-container > * {
  position: relative;
  z-index: 1;
}

.loader-container.fade-out {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

.logo {
  display: flex;
  align-items: flex-end;
  font-family: 'InterLocal', 'Inter', system-ui, sans-serif;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  line-height: 1;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 24px;
  text-transform: uppercase;
  animation: fadeIn 1s ease-out;
}

.logo-dot {
  color: #ebb207;
}

.progress-track {
  width: 140px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.progress-track.hide {
  opacity: 0;
  transform: scaleX(0);
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0%;
  background-color: #ebb207;
  box-shadow: 0 0 8px rgba(235, 178, 7, 0.4);
  transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
