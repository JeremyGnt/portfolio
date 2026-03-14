<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'
</script>

<template>
  <div class="card glass bento-hover-card">
    <h2 class="section-title" style="margin-bottom: 1.5rem;">
      <span class="section-icon"><GraduationCap :size="20" /></span> Éducation
    </h2>
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3 class="school-meta-style">ECE Paris</h3>
          <p class="timeline-role menu-font-role">École d'ingénieur — Majeure Data &amp; Intelligence Artificielle</p>
          <p class="timeline-date">2023 — 2028</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3 class="school-meta-style">Ajou University — Corée du Sud</h3>
          <p class="timeline-role menu-font-role">Algorithmique Avancée, IA & Machine Learning</p>
          <p class="timeline-date">Août 2025 — Décembre 2025</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3 class="school-meta-style">Lycée Pierre Termier</h3>
          <p class="timeline-role menu-font-role">Baccalauréat scientifique — Mention Bien</p>
          <p class="timeline-date">2023</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-font-role {
  font-family: system-ui, sans-serif;
}

.school-meta-style {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #fff;
}
</style>
