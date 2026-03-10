import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ExperienceView from '../views/ExperienceView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ContactView from '../views/ContactView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: HomeView },
        { path: '/experience', component: ExperienceView },
        { path: '/projects', component: ProjectsView },
        { path: '/contact', component: ContactView },
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

export default router
