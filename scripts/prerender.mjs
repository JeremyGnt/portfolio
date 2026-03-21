import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build as viteBuild } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const clientOutDir = path.resolve(rootDir, 'dist')
const ssrOutDir = path.resolve(rootDir, '.ssr')

const seoBlockPattern =
  /<!--app-seo:start-->[\s\S]*?<!--app-seo:end-->|<title>[\s\S]*?<script type="application\/ld\+json" data-seo-structured-data="route">[\s\S]*?<\/script>/
const appPlaceholderPattern = /<div id="app"><\/div>/
const bootLoaderToAppPattern = /<div id="boot-loader"[\s\S]*?<div id="app">/

async function buildClientAndServerBundles() {
  await rm(clientOutDir, { recursive: true, force: true })
  await rm(ssrOutDir, { recursive: true, force: true })

  await viteBuild({
    root: rootDir,
    logLevel: 'info',
  })

  await viteBuild({
    root: rootDir,
    logLevel: 'info',
    build: {
      ssr: path.resolve(rootDir, 'src/entry-server.ts'),
      outDir: ssrOutDir,
      emptyOutDir: true,
    },
  })
}

async function getServerRenderer() {
  const serverEntryPath = path.resolve(ssrOutDir, 'entry-server.js')
  const serverEntry = await import(`${pathToFileURL(serverEntryPath).href}?t=${Date.now()}`)

  if (typeof serverEntry.render !== 'function' || !Array.isArray(serverEntry.prerenderRoutes)) {
    throw new Error('SSR renderer invalide: render() ou prerenderRoutes manquant.')
  }

  return serverEntry
}

function injectPrerenderedMarkup(template, appHtml, headTags) {
  return template
    .replace(seoBlockPattern, `<!--app-seo:start-->\n${headTags}\n  <!--app-seo:end-->`)
    .replace(bootLoaderToAppPattern, '<div id="app">')
    .replace(appPlaceholderPattern, `<div id="app">${appHtml}</div>`)
}

function resolveOutputHtmlPath(routePath) {
  if (routePath === '/') {
    return path.resolve(clientOutDir, 'index.html')
  }

  const normalizedPath = routePath.replace(/^\/+/, '').replace(/\/+$/, '')
  return path.resolve(clientOutDir, normalizedPath, 'index.html')
}

async function prerenderRoutes() {
  const template = await readFile(path.resolve(clientOutDir, 'index.html'), 'utf8')
  const { render, prerenderRoutes: routes } = await getServerRenderer()

  for (const routePath of routes) {
    const { appHtml, headTags } = await render(routePath)
    const html = injectPrerenderedMarkup(template, appHtml, headTags)
    const outputPath = resolveOutputHtmlPath(routePath)

    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, html)
  }
}

try {
  await buildClientAndServerBundles()
  await prerenderRoutes()
} finally {
  await rm(ssrOutDir, { recursive: true, force: true })
}
