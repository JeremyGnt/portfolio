<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import { useSkillTagRepulsion } from '../../../composables/useSkillTagRepulsion'

defineProps<{
  skills: string[]
}>()

const {
  skillContainer,
  setSkillTagRef,
  scheduleSkillMetricsRefresh,
  handleSkillMouseMove,
  handleSkillMouseLeave,
} = useSkillTagRepulsion()
</script>

<template>
  <div class="card glass skill-card">
    <h2 class="section-title" style="margin-bottom: 1rem;">
      <span class="section-icon"><Settings :size="20" /></span> Compétences techniques
    </h2>
    <div
      ref="skillContainer"
      class="skill-tags"
      style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; padding: 0.5rem 0;"
      @mouseenter="scheduleSkillMetricsRefresh"
      @mousemove="handleSkillMouseMove"
      @mouseleave="handleSkillMouseLeave"
    >
      <span
        v-for="(skill, index) in skills"
        :key="skill"
        :ref="(el) => setSkillTagRef(el, index)"
        class="tag"
      >{{ skill }}</span>
    </div>
  </div>
</template>
