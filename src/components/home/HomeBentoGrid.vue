<script setup lang="ts">
import HomeSkillsCard from './cards/HomeSkillsCard.vue'
import HomeSoftSkillsCard from './cards/HomeSoftSkillsCard.vue'
import HomeEducationCard from './cards/HomeEducationCard.vue'
import HomeInterestsCard from './cards/HomeInterestsCard.vue'

defineProps<{
  skills: string[]
}>()
</script>

<template>
  <div id="home-cards-section" class="bento-grid">
    <div class="bento-span-7 bento-stack">
      <div class="reveal">
        <HomeSoftSkillsCard />
      </div>

      <div class="reveal">
        <HomeSkillsCard :skills="skills" />
      </div>
    </div>

    <div class="bento-span-5 bento-stack bento-stack-stretch">
      <div class="reveal">
        <HomeEducationCard />
      </div>

      <div class="reveal reveal-grow">
        <HomeInterestsCard class="flex-1 h-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bento-grid {
  scroll-margin-top: 7.5rem;
}

.bento-stack-stretch {
  height: 100%;
}

.bento-hover-card {
  transform-origin: center center;
  will-change: transform;
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}

.bento-hover-card:hover {
  transform: translateY(-8px) scale(1.012);
}

:deep(.bento-hover-card.glass:hover) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.052) 0%, rgba(255, 255, 255, 0.016) 38%, rgba(255, 255, 255, 0.012) 100%),
    #0f1115;
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(255, 255, 255, 0.02),
    0 24px 48px rgba(0, 0, 0, 0.56);
}

.reveal-grow {
  display: flex;
  flex: 1;
  min-height: 0;
}

.flex-1 {
  flex: 1;
}

.h-full {
  height: 100%;
}
</style>
