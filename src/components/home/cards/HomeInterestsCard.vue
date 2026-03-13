<script setup lang="ts">
import { Target, Music, Medal, Snowflake, CircleDot, Plane } from 'lucide-vue-next'
</script>

<template>
  <div class="card glass">
    <h2 class="section-title">
      <span class="section-icon"><Target :size="20" /></span> Centres d'intérêt
    </h2>
    <div class="interest-tags" style="justify-content: center;">
      <span class="interest-tag"><Music :size="16" /> Piano</span>
      <span class="interest-tag"><Medal :size="16" /> Badminton</span>
      <span class="interest-tag"><Snowflake :size="16" /> Ski</span>
      <span class="interest-tag"><CircleDot :size="16" /> Tennis</span>
      <span class="interest-tag"><Plane :size="16" /> Voyage</span>
    </div>
  </div>
</template>
