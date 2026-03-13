<script setup lang="ts">
import HomeHero from '../components/home/HomeHero.vue'
import HomeBentoGrid from '../components/home/HomeBentoGrid.vue'
import { useHomeLogoAnchoring } from '../composables/useHomeLogoAnchoring'
import { useRevealAnimation } from '../composables/useRevealAnimation'
import { HOME_SKILLS } from '../constants/home'

useRevealAnimation(100)
useHomeLogoAnchoring()
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner">
        <HomeHero />

        <HomeBentoGrid :skills="HOME_SKILLS" />
      </div>
    </section>
  </div>
</template>
