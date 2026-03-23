import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { applyRouteSeo } from '../app/seo'
import { appRoutes } from './routes'

export function createPortfolioRouter() {
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
    routes: appRoutes,
    scrollBehavior() {
      return { top: 0 }
    },
  })

  if (!import.meta.env.SSR) {
    router.afterEach((to) => {
      applyRouteSeo(to)
    })
  }

  return router
}

export default createPortfolioRouter
