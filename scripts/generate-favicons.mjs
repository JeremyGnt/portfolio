import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.resolve(rootDir, 'public')
const sourcePath = path.resolve(publicDir, 'favicon.svg')

const pngTargets = [
  { filename: 'favicon-16x16.png', size: 16 },
  { filename: 'favicon-32x32.png', size: 32 },
  { filename: 'apple-touch-icon.png', size: 180 },
  { filename: 'android-chrome-192x192.png', size: 192 },
  { filename: 'android-chrome-512x512.png', size: 512 },
]

function toIcoDimensionByte(size) {
  return size >= 256 ? 0 : size
}

function createIco(pngImages) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngImages.length, 4)

  const directory = Buffer.alloc(pngImages.length * 16)
  let offset = header.length + directory.length

  pngImages.forEach(({ size, data }, index) => {
    const entryOffset = index * 16

    directory.writeUInt8(toIcoDimensionByte(size), entryOffset)
    directory.writeUInt8(toIcoDimensionByte(size), entryOffset + 1)
    directory.writeUInt8(0, entryOffset + 2)
    directory.writeUInt8(0, entryOffset + 3)
    directory.writeUInt16LE(1, entryOffset + 4)
    directory.writeUInt16LE(32, entryOffset + 6)
    directory.writeUInt32LE(data.length, entryOffset + 8)
    directory.writeUInt32LE(offset, entryOffset + 12)

    offset += data.length
  })

  return Buffer.concat([header, directory, ...pngImages.map(({ data }) => data)])
}

async function renderPng(svgBuffer, size) {
  return sharp(svgBuffer, { density: 512 })
    .resize(size, size)
    .png()
    .toBuffer()
}

async function main() {
  await mkdir(publicDir, { recursive: true })

  const svgBuffer = await readFile(sourcePath)
  const renderedPngs = await Promise.all(
    pngTargets.map(async ({ filename, size }) => {
      const data = await renderPng(svgBuffer, size)
      await writeFile(path.resolve(publicDir, filename), data)

      return { filename, size, data }
    }),
  )

  const icoImages = await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      data: await renderPng(svgBuffer, size),
    })),
  )

  await writeFile(path.resolve(publicDir, 'favicon.ico'), createIco(icoImages))
}

await main()
