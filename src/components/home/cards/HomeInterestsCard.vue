<style scoped>
.interest-tags .interest-tag {
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%) !important;
  color: rgba(255,255,255,0.7) !important;
  border: 1px solid rgba(255,255,255,0.08);
  transition: border-color 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

</style>
<script setup lang="ts">
import { Target, Music, Medal, Snowflake, CircleDot } from 'lucide-vue-next'
</script>

<template>
  <div class="card glass bento-hover-card">
    <h2 class="section-title">
      <span class="section-icon"><Target :size="20" /></span> Centres d'intérêt
    </h2>
    <div class="interest-tags" style="justify-content: center;">
      <span class="interest-tag"><Music :size="16" /> Piano</span>
      <span class="interest-tag"><Medal :size="16" /> Badminton</span>
      <span class="interest-tag"><Snowflake :size="16" /> Ski</span>
      <span class="interest-tag"><CircleDot :size="16" /> Tennis</span>
      
    </div>
  </div>
</template>
