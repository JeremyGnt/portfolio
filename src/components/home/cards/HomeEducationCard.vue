<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'
</script>

<template>
  <div class="card glass">
    <h2 class="section-title" style="margin-bottom: 1.5rem;">
      <span class="section-icon"><GraduationCap :size="20" /></span> Éducation
    </h2>
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3>ECE Paris</h3>
          <p class="timeline-role">École d'ingénieur — Majeure Data &amp; Intelligence Artificielle</p>
          <p class="timeline-date">2023 — 2028</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3>Ajou University — Corée du Sud</h3>
          <p class="timeline-role">Programme d'échange international</p>
          <p class="timeline-date">Août 2025 — Décembre 2025</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3>Lycée Pierre Termier</h3>
          <p class="timeline-role">Baccalauréat scientifique — Mention Bien</p>
          <p class="timeline-date">2023</p>
        </div>
      </div>
    </div>
  </div>
</template>
