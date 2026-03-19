import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const rootDir = process.cwd()

const assets = [
  {
    input: 'public/projects/projet_drawbots.jpg',
    output: 'public/projects/projet_drawbots.webp',
    width: 1200,
    webp: { quality: 80, effort: 6, smartSubsample: true },
  },
  {
    input: 'public/projects/projet_manette.png',
    output: 'public/projects/projet_manette.webp',
    width: 900,
    webp: { quality: 80, effort: 6, smartSubsample: true },
  },
  {
    input: 'public/projects/projet_reveil.jpg',
    output: 'public/projects/projet_reveil.webp',
    width: 900,
    webp: { quality: 78, effort: 6, smartSubsample: true },
  },
  {
    input: 'public/projects/projet_simulation.png',
    output: 'public/projects/projet_simulation.webp',
    width: 1200,
    webp: { quality: 84, effort: 6, smartSubsample: true },
  },
  {
    input: 'public/projects/projet_omnesbnb.jpg',
    output: 'public/projects/projet_omnesbnb.webp',
    width: 1200,
    webp: { quality: 82, effort: 6, smartSubsample: true },
  },
  {
    input: 'public/projects/projet_snoopy.png',
    output: 'public/projects/projet_snoopy.webp',
    width: 900,
    webp: { quality: 82, effort: 6, smartSubsample: true },
  },
  {
    input: 'public/projects/projet_escooked.jpg',
    output: 'public/projects/projet_escooked.webp',
    width: 1200,
    webp: { quality: 82, effort: 6, smartSubsample: true },
  },
  {
    input: 'public/projects/projet_fruitninja.jpg',
    output: 'public/projects/projet_fruitninja.webp',
    width: 1200,
    webp: { quality: 82, effort: 6, smartSubsample: true },
  },
  {
    input: 'public/brands/carrefour-logo.png',
    output: 'public/brands/carrefour-logo.webp',
    width: 320,
    webp: { quality: 88, effort: 6, smartSubsample: true },
  },
]

function formatBytes(value) {
  if (value < 1024) {
    return `${value} B`
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

let totalInputBytes = 0
let totalOutputBytes = 0

for (const asset of assets) {
  const inputPath = path.resolve(rootDir, asset.input)
  const outputPath = path.resolve(rootDir, asset.output)

  await mkdir(path.dirname(outputPath), { recursive: true })

  const transformer = sharp(inputPath)
    .rotate()
    .resize({ width: asset.width, withoutEnlargement: true, fit: 'inside' })
    .webp(asset.webp)

  await transformer.toFile(outputPath)

  const [inputStats, outputStats] = await Promise.all([stat(inputPath), stat(outputPath)])
  totalInputBytes += inputStats.size
  totalOutputBytes += outputStats.size

  const savedBytes = inputStats.size - outputStats.size
  const savedRatio = inputStats.size === 0 ? 0 : ((savedBytes / inputStats.size) * 100).toFixed(1)

  console.log(
    `${asset.input} -> ${asset.output} | ${formatBytes(inputStats.size)} -> ${formatBytes(outputStats.size)} | saved ${formatBytes(savedBytes)} (${savedRatio}%)`,
  )
}

const totalSavedBytes = totalInputBytes - totalOutputBytes
const totalSavedRatio = totalInputBytes === 0 ? 0 : ((totalSavedBytes / totalInputBytes) * 100).toFixed(1)

console.log('')
console.log(`Total input: ${formatBytes(totalInputBytes)}`)
console.log(`Total output: ${formatBytes(totalOutputBytes)}`)
console.log(`Total saved: ${formatBytes(totalSavedBytes)} (${totalSavedRatio}%)`)
