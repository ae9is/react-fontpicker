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
  const font = await opentype.load(fontFile)
  const path = font.getPath(text, x, y, fontSize, options)
  path.stroke = 'black'
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}">`
  svg += path.toSVG(2)
  svg += '</svg>'
  return svg
}

async function main() {
  const fontFile = './font-cache/aclonica.ttf'
  const svgFile = './font-cache/aclonica.svg'
  const text = 'Aclonica'
  console.log(`Calling getTextSvg(${fontFile}, ${text}) ...`)
  const svg = await getTextSvg({ fontFile, text })
  fs.writeFile(svgFile, svg, (err) => {
    if (err) {
      console.log(err)
    }
  })
  console.log('SVG: ', svg)
  console.log('Done')
}

main()
