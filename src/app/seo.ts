import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL } from '../constants/externalLinks'

export const SITE_NAME = 'Jérémy Gonnet'
export const SITE_URL = 'https://jeremygonnet.com'
export const SITE_LANGUAGE = 'fr-FR'
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/og-image.svg`
export const DEFAULT_ROBOTS_CONTENT = 'index,follow,max-image-preview:large'
export const PERSON_SUMMARY =
  'Étudiant ingénieur en informatique, spécialisé en Big Data & IA à l’ECE Paris.'

const GOOGLE_SITE_VERIFICATION = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim() ?? ''
const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? ''
const ICON_LINK_TAGS = [
  '<link rel="icon" href="/favicon.ico" sizes="any" />',
  '<link rel="shortcut icon" href="/favicon.ico" />',
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
  '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
  '<link rel="manifest" href="/manifest.json" />',
]

export type SeoDefinition = {
  title: string
  description: string
}

type RouteMetaWithSeo = {
  seo?: SeoDefinition
}

export type SeoRouteLike = {
  path: string
  meta: RouteMetaWithSeo
}

const DEFAULT_SEO: SeoDefinition = {
  title: 'Jérémy Gonnet',
  description:
    'Étudiant ingénieur, Big Data & IA, ECE Paris',
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

function getRouteSeo(route: SeoRouteLike) {
  const routeMeta = route.meta as RouteMetaWithSeo
  return routeMeta.seo ?? DEFAULT_SEO
}

function resolvePageSchemaType(path: string) {
  switch (normalizePath(path)) {
    case '/contact':
      return 'ContactPage'
    case '/projects':
    case '/experience':
      return 'CollectionPage'
    default:
      return 'AboutPage'
  }
}

function resolvePageName(path: string) {
  switch (normalizePath(path)) {
    case '/contact':
      return 'Contact'
    case '/projects':
      return 'Projets'
    case '/experience':
      return 'Expérience'
    default:
      return 'Accueil'
  }
}

function buildStructuredData(route: SeoRouteLike) {
  const seo = getRouteSeo(route)
  const path = normalizePath(route.path)
  const canonicalUrl = buildCanonicalUrl(path)
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DEFAULT_SEO.description,
      inLanguage: SITE_LANGUAGE,
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: SITE_NAME,
      url: SITE_URL,
      description: PERSON_SUMMARY,
      image: DEFAULT_OG_IMAGE_URL,
      sameAs: [LINKEDIN_PROFILE_URL, GITHUB_PROFILE_URL],
      jobTitle: 'Étudiant ingénieur',
      knowsAbout: [
        'Développement web',
        'Data',
        'Robotique',
        'Systèmes embarqués',
      ],
    },
    {
      '@type': resolvePageSchemaType(path),
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: seo.title,
      description: seo.description,
      inLanguage: SITE_LANGUAGE,
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      about: {
        '@id': `${SITE_URL}/#person`,
      },
    },
  ]

  if (path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: resolvePageName(path),
          item: canonicalUrl,
        },
      ],
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
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

function upsertStructuredDataScript(route: SeoRouteLike) {
  const selector = 'script[data-seo-structured-data="route"]'
  let scriptTag = document.head.querySelector<HTMLScriptElement>(selector)

  if (!scriptTag) {
    scriptTag = document.createElement('script')
    scriptTag.type = 'application/ld+json'
    scriptTag.dataset.seoStructuredData = 'route'
    document.head.append(scriptTag)
  }

  scriptTag.textContent = JSON.stringify(buildStructuredData(route))
}

function buildAnalyticsTags() {
  if (!GOOGLE_ANALYTICS_ID) {
    return ''
  }

  const measurementId = JSON.stringify(GOOGLE_ANALYTICS_ID)

  return [
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(GOOGLE_ANALYTICS_ID)}"></script>`,
    '<script>',
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js', new Date());",
    `gtag('config', ${measurementId});`,
    '</script>',
  ].join('\n')
}

export function renderHeadTags(route: SeoRouteLike) {
  const seo = getRouteSeo(route)
  const canonicalUrl = buildCanonicalUrl(route.path)
  const structuredData = JSON.stringify(buildStructuredData(route))

  const headTags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${DEFAULT_ROBOTS_CONTENT}" />`,
    `<meta name="author" content="${escapeHtml(SITE_NAME)}" />`,
    '<meta name="theme-color" content="#050505" />',
    ...ICON_LINK_TAGS,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    '<meta property="og:locale" content="fr_FR" />',
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:image" content="${DEFAULT_OG_IMAGE_URL}" />`,
    '<meta property="og:image:alt" content="Aperçu du portfolio de Jérémy Gonnet" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE_URL}" />`,
    '<meta name="twitter:image:alt" content="Aperçu du portfolio de Jérémy Gonnet" />',
    GOOGLE_SITE_VERIFICATION
      ? `<meta name="google-site-verification" content="${escapeHtml(GOOGLE_SITE_VERIFICATION)}" />`
      : '',
    `<script type="application/ld+json" data-seo-structured-data="route">${structuredData}</script>`,
    buildAnalyticsTags(),
  ].filter(Boolean)

  return headTags.join('\n')
}

export function applyRouteSeo(route: RouteLocationNormalizedLoaded) {
  if (typeof document === 'undefined') {
    return
  }

  const seo = getRouteSeo(route)
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

  if (GOOGLE_SITE_VERIFICATION) {
    upsertMetaTag('name', 'google-site-verification', GOOGLE_SITE_VERIFICATION)
  }

  upsertLinkTag('canonical', canonicalUrl)
  upsertStructuredDataScript(route)
}
