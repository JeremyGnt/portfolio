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
  <div class="bento-grid">
    <div class="bento-span-7 bento-stack">
      <div class="reveal">
        <HomeSkillsCard :skills="skills" />
      </div>

      <div class="reveal">
        <HomeSoftSkillsCard />
      </div>
    </div>

    <div class="bento-span-5 bento-stack">
      <div class="reveal">
        <HomeEducationCard />
      </div>

      <div class="reveal">
        <HomeInterestsCard />
      </div>
    </div>
  </div>
</template>
