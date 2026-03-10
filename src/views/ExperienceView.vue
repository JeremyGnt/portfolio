<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import { Briefcase, Award, HeartHandshake } from 'lucide-vue-next'

function triggerReveal() {
  const revealEls = document.querySelectorAll('.reveal')
  revealEls.forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 24 })
    gsap.to(el, { opacity: 1, y: 0, duration: 0.65, delay: i * 0.08, ease: 'power2.out' })
  })
}

onMounted(() => setTimeout(triggerReveal, 100))
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner">
        <div class="hero reveal">
          <p class="hero-kicker">Parcours</p>
          <h1>Expériences <span class="gradient-text">&amp; Certifications</span></h1>
        </div>

        <div class="section-block reveal">
          <h2 class="section-title">
            <span class="section-icon"><Briefcase :size="20" /></span> Expérience professionnelle
          </h2>
          <div class="card glass exp-card">
            <div class="exp-header">
              <div>
                <h3>Stage Ingénieur — Carrefour</h3>
                <p class="timeline-role">Stage 5 semaines · 2026</p>
              </div>
              <span class="exp-badge">Stage</span>
            </div>
            <ul class="bullet-list">
              <li>Analyse de données commerciales</li>
              <li>Mise en place de logiques d'optimisation</li>
              <li>Gestion opérationnelle</li>
              <li>Utilisation d'outils numériques pour l'analyse</li>
              <li>Aide à la prise de décision basée sur les données</li>
            </ul>
          </div>
        </div>

        <div class="section-block reveal">
          <h2 class="section-title">
            <span class="section-icon"><Award :size="20" /></span> Certifications
          </h2>
          <div class="cert-grid">
            <div class="card glass cert-card">
              <div class="cert-icon">🗄️</div>
              <div>
                <h3>Certification SQL</h3>
                <p class="timeline-role">Liora (ex DataScientest) · 2024</p>
              </div>
            </div>
            <div class="card glass cert-card">
              <div class="cert-icon">⚛️</div>
              <div>
                <h3>Certification Nanosciences</h3>
                <p class="timeline-role">2026</p>
              </div>
            </div>
            <div class="card glass cert-card">
              <div class="cert-icon">📋</div>
              <div>
                <h3>MOOC Gestion de Projet</h3>
                <p class="timeline-role">2026</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section-block reveal">
          <h2 class="section-title">
            <span class="section-icon"><HeartHandshake :size="20" /></span> Volontariat
          </h2>
          <div class="vol-grid">
            <div class="card glass" style="padding: 1.5rem;">
              <h3>Récup &amp; Gamelles</h3>
              <p class="timeline-role">Bénévole étudiant</p>
              <p class="vol-desc">
                Association de redistribution alimentaire. Animations et sensibilisations sur le
                gaspillage alimentaire, collecte d'invendus, préparation de repas à coût réduit.
              </p>
              <div class="skill-tags mt-sm">
                <span v-for="t in ['Travail d\'équipe', 'Engagement social', 'Organisation', 'Responsabilité']" :key="t" class="tag">{{ t }}</span>
              </div>
            </div>
            <div class="card glass" style="padding: 1.5rem;">
              <h3>Scouts et Guides de France</h3>
              <p class="timeline-role">Engagement 6 ans</p>
              <p class="vol-desc">
                Six années d'engagement au sein des Scouts et Guides de France,
                développant leadership, gestion de groupe et sens de l'initiative.
              </p>
              <div class="skill-tags mt-sm">
                <span v-for="t in ['Leadership', 'Gestion de groupe', 'Autonomie', 'Initiative']" :key="t" class="tag">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
