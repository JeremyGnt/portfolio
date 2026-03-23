import './styles/base.css'
import './styles/tailwind.css'
import { createPortfolioApp } from './app/createPortfolioApp'
import { applyRouteSeo } from './app/seo'

const { app, router } = createPortfolioApp()

void router.isReady().then(() => {
  applyRouteSeo(router.currentRoute.value)
  app.mount('#app')
})
