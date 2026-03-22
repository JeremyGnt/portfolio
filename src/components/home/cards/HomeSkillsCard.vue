<style scoped>
.skill-card {
  padding: 1.5rem;
}

.skill-card-title {
  margin-bottom: 1rem;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.skill-tags .tag {
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%) !important;
  color: rgba(255,255,255,0.7) !important;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  transition: border-color 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@media (max-width: 768px) {
  .skill-card {
    padding: 1.15rem;
  }

  .skill-card-title {
    margin-bottom: 0.8rem;
  }

  .skill-tags {
    gap: 0.4rem;
    padding: 0.2rem 0 0;
  }

  .skill-tags .tag {
    padding: 0.3rem 0.72rem;
    font-size: 0.76rem;
  }
}

</style>
<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import { useSkillTagRepulsion } from '../../../composables/useSkillTagRepulsion'

defineProps<{
  skills: string[]
}>()

const importantSkills = [
  'Python', 'JavaScript', 'Java', 'TypeScript', 'SQL', 'Git', 'GitHub', 'Machine Learning'
]

const {
  skillContainer,
  setSkillTagRef,
  scheduleSkillMetricsRefresh,
  handleSkillMouseMove,
  handleSkillMouseLeave,
} = useSkillTagRepulsion()
</script>

<template>
  <div class="card glass skill-card bento-hover-card">
    <h2 class="section-title skill-card-title">
      <span class="section-icon"><Settings :size="20" /></span> Compétences techniques
    </h2>
    <div
      ref="skillContainer"
      class="skill-tags"
      @mouseenter="scheduleSkillMetricsRefresh"
      @mousemove="handleSkillMouseMove"
      @mouseleave="handleSkillMouseLeave"
    >
      <span
          v-for="(skill, index) in skills"
          :key="skill"
          :ref="(el) => setSkillTagRef(el, index)"
          class="tag"
          :style="{
            color: importantSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()) ? '#ffffff !important' : '#babbbc'
          }"
        >{{ skill }}</span>
    </div>
  </div>
</template>
