import './style.css'
import './tailwind.css'
import { createPortfolioApp } from './app'
import { applyRouteSeo } from './seo'

const { app, router } = createPortfolioApp()

void router.isReady().then(() => {
  applyRouteSeo(router.currentRoute.value)
  app.mount('#app')
})
