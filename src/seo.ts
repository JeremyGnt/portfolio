import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const SITE_NAME = 'Jérémy Gonnet'
export const SITE_URL = 'https://jeremygonnet.com'
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/og-image.svg`
export const DEFAULT_ROBOTS_CONTENT = 'index,follow,max-image-preview:large'

export type SeoDefinition = {
  title: string
  description: string
}

type RouteMetaWithSeo = {
  seo?: SeoDefinition
}

const DEFAULT_SEO: SeoDefinition = {
  title: 'Jérémy Gonnet | Portfolio ingénieur, data et développement',
  description:
    'Portfolio de Jérémy Gonnet, élève ingénieur. Projets en développement web, data, robotique et systèmes embarqués.',
}

function normalizePath(path: string) {
  if (!path || path === '/') {
    return '/'
  }

  return path.replace(/\/+$/, '')
}

function buildCanonicalUrl(path: string) {
  return new URL(normalizePath(path), SITE_URL).toString()
}

function upsertMetaTag(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`
  let metaTag = document.head.querySelector<HTMLMetaElement>(selector)

  if (!metaTag) {
    metaTag = document.createElement('meta')
    metaTag.setAttribute(attribute, key)
    document.head.append(metaTag)
  }

  metaTag.setAttribute('content', content)
}

function upsertLinkTag(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`
  let linkTag = document.head.querySelector<HTMLLinkElement>(selector)

  if (!linkTag) {
    linkTag = document.createElement('link')
    linkTag.setAttribute('rel', rel)
    document.head.append(linkTag)
  }

  linkTag.setAttribute('href', href)
}

export function applyRouteSeo(route: RouteLocationNormalizedLoaded) {
  const routeMeta = route.meta as RouteMetaWithSeo
  const seo = routeMeta.seo ?? DEFAULT_SEO
  const canonicalUrl = buildCanonicalUrl(route.path)

  document.documentElement.lang = 'fr'
  document.title = seo.title

  upsertMetaTag('name', 'description', seo.description)
  upsertMetaTag('name', 'robots', DEFAULT_ROBOTS_CONTENT)
  upsertMetaTag('name', 'author', SITE_NAME)
  upsertMetaTag('name', 'theme-color', '#050505')
  upsertMetaTag('property', 'og:locale', 'fr_FR')
  upsertMetaTag('property', 'og:type', 'website')
  upsertMetaTag('property', 'og:site_name', SITE_NAME)
  upsertMetaTag('property', 'og:title', seo.title)
  upsertMetaTag('property', 'og:description', seo.description)
  upsertMetaTag('property', 'og:url', canonicalUrl)
  upsertMetaTag('property', 'og:image', DEFAULT_OG_IMAGE_URL)
  upsertMetaTag('property', 'og:image:alt', 'Aperçu du portfolio de Jérémy Gonnet')
  upsertMetaTag('name', 'twitter:card', 'summary_large_image')
  upsertMetaTag('name', 'twitter:title', seo.title)
  upsertMetaTag('name', 'twitter:description', seo.description)
  upsertMetaTag('name', 'twitter:image', DEFAULT_OG_IMAGE_URL)
  upsertMetaTag('name', 'twitter:image:alt', 'Aperçu du portfolio de Jérémy Gonnet')
  upsertLinkTag('canonical', canonicalUrl)
}
