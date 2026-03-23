import { renderToString } from '@vue/server-renderer'
import { createPortfolioApp } from './createPortfolioApp'
import { renderHeadTags } from './seo'
import { prerenderRoutes } from '../router/routes'

export { prerenderRoutes }

export async function render(url: string) {
  const { app, router } = createPortfolioApp()

  await router.push(url)
  await router.isReady()

  const route = router.currentRoute.value
  const appHtml = await renderToString(app)
  const headTags = renderHeadTags(route)

  return {
    appHtml,
    headTags,
  }
}
