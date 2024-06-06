// Writes out SVG image representation (using paths i.e. not SVG font file)
//  of some text given a font file.
// For node.js.

import opentype from 'opentype.js'
import * as fs from 'fs'

interface GetTextSvgOptions {
  fontFile: string
  text: string
  x?: number
  y?: number
  cellHeight?: number
  scale?: number
  width?: number
  height?: number
  fontSize?: number
  options?: opentype.RenderOptions
}

export async function getTextSvg({
  fontFile,
  text,
  cellHeight = 40,
  x = 0,
  y = cellHeight / 2,
  scale = 1,
  //width = 600 * scale,
  width = 100,
  height = cellHeight * scale,
  fontSize = 16,
  options,
}: GetTextSvgOptions) {
  // opentype.load() deprecated/removed in upcoming Opentype.js v2.0
  //const font = await opentype.load(fontFile)
  const buff = await fs.promises.readFile(fontFile)
  const arrayBuffer = new Uint8Array(buff).buffer
  // const font = await opentype.parse(buff) Opentype.js v2.0
  const font = await opentype.parse(arrayBuffer) // v1.x
  const path = font.getPath(text, x, y, fontSize, options)
  path.stroke = 'black'
  path.strokeWidth = 0.1
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}">`
  svg += path.toSVG(2)
  svg += '</svg>'
  return svg
}

async function generateOnePreview() {
  const fontFile = './font-cache/audiowide.ttf'
  const svgFile = './font-cache/audiowide.svg'
  const text = 'Audiowide'
  console.log(`Calling getTextSvg(${fontFile}, ${text}) ...`)
  const svg = await getTextSvg({ fontFile, text })
  fs.writeFile(svgFile, svg, (err) => {
    if (err) {
      console.log(err)
    }
  })
  //console.log('SVG: ', svg)
  console.log('Done')
}

async function generateAllPreviews() {
  const FONT_CACHE_DIR = './font-cache/'
  try {
    console.log('Generating SVG font representations ...')
    const files = (
      await fs.promises.readdir(FONT_CACHE_DIR, {
        withFileTypes: true,
        recursive: false,
      })
    )
      .filter((x) => x.isFile() && x.name.endsWith('.ttf'))
      .sort()
    const promises = files.map((f) =>
      (async () => {
        const fontFile = f.parentPath + f.name
        const svgFile = fontFile.replace('.ttf', '.svg')
        const text = f.name.charAt(0).toUpperCase() + f.name.substring(1).replace(/-/g, ' ').replace(/.ttf$/, '')
        const svg = await getTextSvg({ fontFile, text })
        fs.writeFile(svgFile, svg, (err) => {
          if (err) {
            console.log(err)
          }
          console.log(`${text}`)
        })
      })()
    )
    await Promise.all(promises)
    console.log('Done')
  } catch (err) {
    console.error(err)
  }
}

async function main() {
  //await generateOnePreview()
  await generateAllPreviews()
}

main()
