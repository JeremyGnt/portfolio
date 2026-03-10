<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import { Gamepad2, ChefHat, AlarmClock, Leaf, Home, Bot } from 'lucide-vue-next'

interface Project {
  year: number
  tags: string[]
  icon: object
  title: string
  description: string
  footerTags: string[]
}

const projects: Project[] = [
  {
    year: 2024,
    tags: ['VHDL', 'FPGA'],
    icon: Gamepad2,
    title: 'Fruit Ninja — FPGA',
    description: "Jeu Fruit Ninja sur FPGA contrôlé par un capteur ultrason. Détection de mouvement, calcul de trajectoire, courbure dynamique de la lame, détection de collision et système de score.",
    footerTags: ['FPGA', 'Capteurs ultrason', 'Logique séquentielle'],
  },
  {
    year: 2024,
    tags: ['C++', 'Embarqué'],
    icon: Gamepad2,
    title: 'Manette de jeu vidéo',
    description: "Développement d'une manette de jeu programmable basée sur un microcontrôleur ATTiny avec écran OLED et interface de contrôle personnalisée.",
    footerTags: ['C++', 'ATTiny', 'OLED'],
  },
  {
    year: 2024,
    tags: ['C', 'Allegro 5'],
    icon: ChefHat,
    title: 'Jeu multijoueur Overcooked',
    description: "Jeu multijoueur inspiré d'Overcooked avec interface graphique développée avec Allegro 5 et programmation système avancée.",
    footerTags: ['C', 'Allegro 5', 'Programmation système'],
  },
  {
    year: 2024,
    tags: ['C++', 'Embarqué'],
    icon: AlarmClock,
    title: 'Réveil électronique',
    description: "Création d'un réveil électronique programmable avec développement d'un programme embarqué sur microcontrôleur.",
    footerTags: ['C++', 'Microcontrôleur'],
  },
  {
    year: 2024,
    tags: ['Python', 'Simulation'],
    icon: Leaf,
    title: 'Simulation réseaux trophiques',
    description: "Application simulant la dynamique de réseaux trophiques pour étudier les interactions entre espèces dans un écosystème avec modélisation mathématique.",
    footerTags: ['Python', 'Modélisation', 'Simulation'],
  },
  {
    year: 2025,
    tags: ['JavaScript', 'PHP'],
    icon: Home,
    title: 'Airbnb for Students',
    description: "Plateforme web inspirée d'Airbnb dédiée aux étudiants, avec recherche de logements, favoris, avis utilisateurs et base de données de logements.",
    footerTags: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
  },
  {
    year: 2025,
    tags: ['ESP32', 'Robotique'],
    icon: Bot,
    title: 'Drawbot — Robot dessinateur',
    description: "Robot mobile autonome dessinant des formes géométriques. Contrôle PID, encodeurs moteurs, centrale inertielle et magnétomètre pour la navigation autonome.",
    footerTags: ['ESP32', 'PID', 'IMU', 'Embarqué'],
  },
]

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
          <p class="hero-kicker">Réalisations</p>
          <h1>Mes <span class="gradient-text">Projets</span></h1>
          <p class="hero-description">Une sélection de projets académiques et personnels.</p>
        </div>

        <div class="projects-grid reveal">
          <article v-for="project in projects" :key="project.title" class="card glass project-card">
            <div class="project-header">
              <span class="project-year">{{ project.year }}</span>
              <div class="project-tags">
                <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <h3>
              <component :is="project.icon" style="width:20px;height:20px;margin-right:4px;display:inline-block;vertical-align:text-bottom;" />
              {{ project.title }}
            </h3>
            <p class="project-desc">{{ project.description }}</p>
            <div class="project-footer">
              <div class="skill-tags">
                <span v-for="tag in project.footerTags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
