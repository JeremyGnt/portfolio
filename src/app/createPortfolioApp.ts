import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPortfolioRouter } from '../router'

export function createPortfolioApp() {
  const app = createSSRApp(App)
  const router = createPortfolioRouter()

  app.use(router)

  return { app, router }
}
