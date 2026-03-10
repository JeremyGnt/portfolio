<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import {
  GraduationCap,
  Settings,
  Lightbulb,
  Target,
  Music,
  Medal,
  Snowflake,
  CircleDot,
  Plane,
} from 'lucide-vue-next'

function triggerReveal() {
  const revealEls = document.querySelectorAll('.reveal')
  revealEls.forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 24 })
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      delay: i * 0.08,
      ease: 'power2.out',
    })
  })
}

onMounted(() => {
  setTimeout(triggerReveal, 100)
})
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner">
        <div class="hero-grid reveal">
          <div class="hero">
            <p class="hero-kicker">Étudiant Ingénieur · Data &amp; IA</p>
            <h1 class="hero-name">Jérémy <span class="gradient-text">Gonnet</span></h1>
            <p class="hero-subtitle">20 ans · ECE Paris · 3ème année</p>
            <p class="hero-description">
              Étudiant en école d'ingénieur passionné par la Data et l'Intelligence Artificielle,
              je construis des solutions numériques élégantes et performantes.
            </p>
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
              <RouterLink to="/contact" class="btn-liquid-glass" style="padding: 0.75rem 1.5rem; font-weight: 500;">Me contacter</RouterLink>
              <a href="https://github.com/JeremyGnt" target="_blank" class="btn-liquid-glass" style="padding: 0.75rem 1.5rem; font-weight: 500; opacity: 0.9;">Mon GitHub</a>
            </div>
          </div>

          <div class="section-block hero-education">
            <div class="card glass">
              <h2 class="section-title" style="margin-bottom: 2rem;">
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
          </div>
        </div>

        <div class="section-block reveal">
          <h2 class="section-title">
            <span class="section-icon"><Settings :size="20" /></span> Compétences techniques
          </h2>
          <div class="two-col-grid">
            <div class="card glass skill-card" style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div>
                <h3>Langages</h3>
                <div class="skill-tags">
                  <span v-for="lang in ['C', 'C++', 'Python', 'VHDL', 'PHP', 'Java', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'jQuery']"
                    :key="lang" class="tag">{{ lang }}</span>
                </div>
              </div>
              <div>
                <h3>Frameworks &amp; Librairies</h3>
                <div class="skill-tags">
                  <span v-for="fw in ['Tailwind CSS', 'Vue.js', 'Three.js', 'GSAP', 'Allegro 5', 'Arduino', 'Vite', 'Bootstrap']"
                    :key="fw" class="tag">{{ fw }}</span>
                </div>
              </div>
            </div>
            <div class="card glass skill-card" style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div>
                <h3>Bases de données</h3>
                <div class="skill-tags">
                  <span v-for="db in ['MySQL', 'SQL', 'Supabase']" :key="db" class="tag">{{ db }}</span>
                </div>
              </div>
              <div>
                <h3>Outils &amp; DevOps</h3>
                <div class="skill-tags">
                  <span v-for="tool in ['Git', 'GitHub', 'Vercel', 'VS Code', 'CLion', 'PhpStorm', 'IntelliJ', 'Quartus', 'Arduino IDE']"
                    :key="tool" class="tag">{{ tool }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="two-col-grid reveal">
          <div class="card glass">
            <h2 class="section-title">
              <span class="section-icon"><Lightbulb :size="20" /></span> Soft Skills
            </h2>
            <ul class="bullet-list">
              <li>Esprit d'équipe &amp; communication</li>
              <li>Travail en autonomie</li>
              <li>Gestion de projet</li>
              <li>Curiosité intellectuelle</li>
              <li>Esprit analytique</li>
              <li>Organisation &amp; gestion du temps</li>
            </ul>
          </div>
          <div class="card glass">
            <h2 class="section-title">
              <span class="section-icon"><Target :size="20" /></span> Centres d'intérêt
            </h2>
            <div class="interest-tags">
              <span class="interest-tag"><Music style="width:16px;height:16px;margin-right:4px;display:inline-block;vertical-align:text-bottom;" /> Piano</span>
              <span class="interest-tag"><Medal style="width:16px;height:16px;margin-right:4px;display:inline-block;vertical-align:text-bottom;" /> Badminton</span>
              <span class="interest-tag"><Snowflake style="width:16px;height:16px;margin-right:4px;display:inline-block;vertical-align:text-bottom;" /> Ski</span>
              <span class="interest-tag"><CircleDot style="width:16px;height:16px;margin-right:4px;display:inline-block;vertical-align:text-bottom;" /> Tennis</span>
              <span class="interest-tag"><Plane style="width:16px;height:16px;margin-right:4px;display:inline-block;vertical-align:text-bottom;" /> Voyage</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
