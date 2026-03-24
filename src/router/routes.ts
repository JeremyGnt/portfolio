import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ExperienceView from '../views/ExperienceView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ContactView from '../views/ContactView.vue'

export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      seo: {
        title: 'Jérémy Gonnet',
        description:
          'Portfolio de Jérémy Gonnet, étudiant ingénieur en Data & IA.',
      },
    },
  },
  {
    path: '/experience',
    name: 'experience',
    component: ExperienceView,
    meta: {
      seo: {
        title: 'Expérience et certifications | Jérémy Gonnet',
        description:
          'Découvrez les expériences, certifications et engagements de Jérémy Gonnet en ingénierie, data et gestion de projet.',
      },
    },
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
    meta: {
      seo: {
        title: 'Projets | Jérémy Gonnet',
        description:
          'Parcourez les projets de Jérémy Gonnet en développement web, simulation, robotique, embarqué et programmation système.',
      },
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView,
    meta: {
      seo: {
        title: 'Contact | Jérémy Gonnet',
        description:
          'Contactez Jérémy Gonnet pour échanger autour d’un stage, d’un projet ou d’une collaboration en développement et data.',
      },
    },
  },
]

export const prerenderRoutes = appRoutes.map((route) => route.path)
