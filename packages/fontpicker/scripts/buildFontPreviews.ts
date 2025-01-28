import opentype from 'opentype.js'
import * as fs from 'fs'
import * as process from 'process'
import * as path from 'path'

function printHelp() {
  const scriptName = process.argv[0]
  const l: string[] = []
  l.push('Usage:')
  l.push('')
  l.push('Manual font previews generation...')
  l.push(
    `\t${scriptName} <output-directory> "FontName|font-category|0,400+0,700+1,400+1,700|/path/to/font.ttf" "Font2|serif|0,400|/path/to/font2.ttf"`
  )
  l.push('')
  l.push('Google font previews generation...')
  l.push(`\t${scriptName} OPTIONS`)
  l.push('')
  l.push('\tOPTIONS:')
  l.push(
    '\t--filter <file>: Font filter file, one font name per line. Additional filter on fonts included in previews.'
  )
  l.push('\t--googlefonts: Retrieve fonts from Google (as opposed to manual preview generation). Implied by --lite.')
  l.push('\t--lite: Build a lighter weight set of font previews.')
  l.push("\t--no-replace: Don't replace old downloaded Google font info JSON.")
  l.push('\t--num-fonts <int>: Number of fonts to limit the list to.')
  l.push('\t--slice-size <int>: Number of fonts to include per preview image.')
  for (const line of l) {
    println(line)
  }
}

function println(line: string) {
  return console.log(`${line}`)
}

interface GoogleFontInfo {
  family: string
  variants: string[]
  subsets: string[]
  version: string
  lastModified: string
  files: { [key: string]: string }
  category: string
  kind: string
  menu: string
}

interface FontPreviewInfo {
  category: string
  name: string
  sane: string
  variants: string[]
  subsets?: string[]
}

interface DownloadedFont {
  name: string
  category: string
  localFile: string
  localFileSvg: string
  variants: string[]
  subsets?: string[]
  sanename?: string
  top?: number
}

class GoogleFonts {
  static apiKey: string
  static fontPath: string

  static async fetchAll(
    apiKey: string,
    fontPath: string,
    numFonts?: number,
    noReplaceOldFontInfos?: boolean,
    filterFile?: string
  ) {
    this.fontPath = fontPath
    this.apiKey = apiKey
    if (!fs.existsSync(fontPath)) {
      println(`Creating cache directory: ${fontPath}`)
      fs.mkdirSync(fontPath, {
        mode: '0755',
        recursive: true,
      })
    }
    const fontInfos: GoogleFontInfo[] = await this.getFontList(noReplaceOldFontInfos, numFonts, filterFile)
    const fonts: DownloadedFont[] = []
    for (const info of fontInfos) {
      let remoteFile: string
      if (info?.files?.['regular']) {
        remoteFile = info.files['regular']
      } else if (info?.files?.['400']) {
        remoteFile = info.files['400']
      } else if (info?.files?.['300']) {
        remoteFile = info.files['300']
      } else if (info?.files?.['500']) {
        remoteFile = info.files['500']
      } else {
        remoteFile = Object.values(info.files as object)[0]
      }
      const fontFamily: string = info['family']
      const localFileBase = fontPath + '/' + sanify(fontFamily)
      const localFile = localFileBase + '.ttf'
      const localFileSvg = localFileBase + '.svg'
      if (!fs.existsSync(localFile)) {
        println('Downloading font file ' + remoteFile + ' ...')
        const resp = await fetch(remoteFile)
        const buff = await resp.arrayBuffer()
        fs.writeFileSync(localFile, Buffer.from(buff))
      }
      const font: DownloadedFont = {
        name: info['family'],
        category: info['category'],
        localFile: localFile,
        localFileSvg: localFileSvg,
        variants: this.shortVariants(info),
        subsets: info['subsets'],
      }
      fonts.push(font)
    }
    return fonts
  }

  static shortVariants(fontInfo: GoogleFontInfo) {
    const shortVariants: string[] = []
    const re = /^([0-9]+)italic$/
    for (const longVariant of fontInfo['variants']) {
      const matches = longVariant.match(re)
      if (longVariant == 'regular') {
        shortVariants.push('0,400')
      } else if (longVariant == 'italic') {
        shortVariants.push('1,400')
      } else if (!Number.isNaN(Number(longVariant))) {
        shortVariants.push(`0,${longVariant}`)
      } else if (matches) {
        shortVariants.push(`1,${matches[1]}`)
      } else {
        throw new Error(`Error processing ${longVariant}`)
      }
    }
    return shortVariants
  }

  static async getFontList(
    noReplaceOldFontInfos?: boolean,
    numFonts?: number,
    filterFile?: string
  ): Promise<GoogleFontInfo[]> {
    const filterList: string[] = []
    if (filterFile) {
      if (!fs.existsSync(filterFile)) {
        throw new Error('Font filter file does not exist: ' + filterFile)
      }
      const f = await fs.promises.open(filterFile)
      for await (const line of f.readLines()) {
        const font: string = line.trim()
        filterList.push(font)
      }
    }
    const localJsonFile = this.fontPath + '/fonts.json'
    const modifiedTime = fs.statSync(localJsonFile, { throwIfNoEntry: false })?.mtime
    const age = Math.abs(new Date().getTime() - (modifiedTime?.getTime() ?? 0))
    const oneWeekMillis = 1000 * 60 * 60 * 24 * 7
    if (!fs.existsSync(localJsonFile) || (!noReplaceOldFontInfos && age > oneWeekMillis)) {
      println('Font cache info file missing or out of date, downloading ...')
      // Only useful to sort by popularity if we're limiting the number of fonts. But this lets us keep our font-cache
      //  the same between --lite and regular builds.
      // ref: https://developers.google.com/fonts/docs/developer_api
      const apiBaseUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?key='
      const url = apiBaseUrl + this.apiKey + '&sort=popularity'
      const resp = await fetch(url)
      const remoteJson = await resp.json()
      if (remoteJson?.['items']) {
        fs.writeFileSync(localJsonFile, JSON.stringify(remoteJson))
      }
    }
    const localJson = JSON.parse(fs.readFileSync(localJsonFile).toString())
    const items: GoogleFontInfo[] = localJson?.items
    if (!items || !(items?.length > 0)) {
      throw new Error('Failed to get fonts')
    }
    let filterFunc: (font: GoogleFontInfo) => boolean
    if (filterList?.length > 0) {
      filterFunc = function (font) {
        return filterList.includes(font['family'])
      }
    } else {
      filterFunc = function (font) {
        // We only want fonts with a latin subset
        if (!font['subsets'].includes('latin')) {
          return false
        }
        // A few fonts just don't work for some reason
        if (['Kumar One', 'Kumar One Outline'].includes(font['family'])) {
          return false
        }
        return true
      }
    }
    let fontInfos: GoogleFontInfo[] = localJson?.items?.filter(filterFunc)
    // Slice off extra before sorting, i.e. respect user font order in manual font filter list
    if (numFonts) {
      fontInfos = fontInfos.slice(0, numFonts)
    }
    fontInfos.sort(function (fontA: GoogleFontInfo, fontB: GoogleFontInfo) {
      return fontA?.family?.localeCompare(fontB?.family)
    })
    return fontInfos
  }
}

function sanify(fontName: string): string {
  return fontName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
}

class FontPreviewBuilder {
  static outputPath: string
  static cellHeight = 40

  static async generatePreview(fonts: DownloadedFont[], outputPath: string, sliceSize: number) {
    println('Generating previews for ' + fonts.length + ' fonts to: ' + outputPath)
    this.outputPath = outputPath
    if (!fs.existsSync(outputPath)) {
      println('Creating output font previews directory: ' + outputPath)
      fs.mkdirSync(outputPath, {
        mode: '0755',
        recursive: true,
      })
    }
    let num = 0
    for (const font of fonts) {
      font['sanename'] = sanify(font['name'])
      font['top'] = (num % sliceSize) * this.cellHeight
      num++
    }
    await Promise.all([
      this.makeJson(fonts),
      this.makeImages(fonts, sliceSize),
      this.makeCss(fonts, sliceSize),
      this.makeHtml(fonts),
    ])
  }

  static async makeJson(fonts: DownloadedFont[]) {
    println('Creating font info JSON file ...')
    const json: FontPreviewInfo[] = []
    for (const font of fonts) {
      const j: FontPreviewInfo = {
        category: font['category'],
        name: font['name'],
        sane: font['sanename'] ?? sanify(font.name),
        variants: font['variants'],
        subsets: font['subsets'],
      }
      json.push(j)
    }
    fs.writeFileSync(this.outputPath + '/fontInfo.json', JSON.stringify(json, null, 2))
  }

  static async makeImages(fonts: DownloadedFont[], sliceSize: number) {
    println('Creating font preview images ...')
    for (let i = 0; i < fonts.length / sliceSize; i++) {
      println('Slice ' + (i + 1) + '/' + Math.ceil(fonts.length / sliceSize))
      const start = Math.ceil(i * sliceSize)
      const end = start + sliceSize
      const slice = fonts.slice(start, end)
      await this.makeImage(slice, this.outputPath + '/sprite.' + (i + 1))
    }
  }

  static async makeImage(fonts: DownloadedFont[], outFile: string) {
    const outScale = 1
    const dstW = Math.ceil(600 * outScale)
    const dstH = Math.ceil(this.cellHeight * fonts?.length * outScale)
    const fontSize = Math.ceil(22 * outScale)
    const indent = Math.ceil(10 * outScale)
    const baseline = Math.ceil((this.cellHeight * 0.7) * outScale)
    const svgImage: string[] = []
    svgImage.push('<svg xmlns="http://www.w3.org/2000/svg" ')
    svgImage.push('xmlns:xlink="http://www.w3.org/1999/xlink" ')
    svgImage.push('version="1.1" ')
    svgImage.push('x="0px" y="0px" ')
    svgImage.push('width="' + dstW + 'px" height="' + dstH + 'px" ')
    svgImage.push('viewBox="0 0 ' + dstW + ' ' + dstH + '">')
    for (const font of fonts) {
      const buff = await fs.promises.readFile(font.localFile)
      const arrayBuffer = new Uint8Array(buff).buffer
      // const opentypeFont = await opentype.parse(buff) // for Opentype.js v2.0
      const opentypeFont = await opentype.parse(arrayBuffer) // for v1.x
      const text = font.name
      const dstTop = Math.ceil(font.top ?? 0 * outScale) + baseline
      const path = opentypeFont.getPath(text, indent, dstTop, fontSize, {
        kerning: true,
      })
      path.strokeWidth = 0.1
      svgImage.push(path.toSVG(2))
    }
    svgImage.push('</svg>')
    fs.writeFileSync(outFile + '.svg', svgImage.join('\n'))
  }

  static async makeCss(fonts: DownloadedFont[], sliceSize: number) {
    println('Generating CSS ...')
    const css: string[] = []
    css.push('[class*=" font-preview-"],')
    css.push('[class^="font-preview-"] {')
    css.push('  background-size: 30em auto;')
    css.push('  background-repeat: no-repeat;')
    css.push('  height: 2em;')
    css.push('  image-rendering: optimizequality;')
    css.push('}')
    for (let i = 0; i < fonts.length / sliceSize; i++) {
      const start = Math.ceil(i * sliceSize)
      const end = start + sliceSize
      const slice = fonts.slice(start, end)
      for (const font of slice) {
        css.push('.font-preview-' + font['sanename'] + ',')
      }
      css.push('.font-preview-on-all {')
      css.push('  background-image: url(sprite.' + (i + 1) + '.svg);')
      css.push('}')
    }
    for (const font of fonts) {
      css.push('.font-preview-' + font['sanename'] + '{ background-position: 0px -' + ((font.top ?? 0) / 20) + 'em }')
    }
    fs.writeFileSync(this.outputPath + '/font-previews.css', css.join('\n'))
  }

  static async makeHtml(fonts: DownloadedFont[]) {
    println('Generating HTML ...')
    const html: string[] = []
    html.push('<!DOCTYPE html>')
    html.push('<html>')
    html.push('<head>')
    html.push('    <title>Font previews</title>')
    html.push('    <meta charset="UTF-8">')
    html.push('    <meta name="viewport" content="width=device-width, initial-scale=1.0">')
    html.push('    <link href="font-previews.css" rel="stylesheet" />')
    html.push('</head>')
    html.push('<body>')
    for (const font of fonts) {
      html.push('    <div class="font-preview-' + font['sanename'] + '" title="' + font['name'] + '"></div>')
    }
    html.push('</body>')
    html.push('</html>')
    fs.writeFileSync(this.outputPath + '/font-previews.html', html.join('\n'))
  }
}

async function isDir(path: string) {
  try {
    const stats = await fs.promises.lstat(path)
    return stats.isDirectory()
  } catch (e) {
    return false
  }
}

async function main() {
  // Convert from space delimited arguments to ' --' delimited arguments.
  const argsString: string = process.argv?.join(' ')
  const newArgs = argsString.split(' --')

  const opts: { [key: string]: string } = {}
  const re = /^([^=\s]+)([=\s]?)(.*)/g
  for (let i = 1; i < newArgs.length; i++) {
    const matches = newArgs[i]?.matchAll(re)
    for (const m of matches) {
      const key = m[1] // First regexp group in expression
      const val = m?.[3] || 'true'
      opts[key] = val
    }
  }

  if ('help' in opts) {
    printHelp()
    process.exit(0)
  }

  let filterFile: string | undefined = undefined
  let numFonts: number | undefined = undefined
  let lite = false
  let sliceSize = 200
  const noReplaceOldFontInfos = 'no-replace' in opts
  let googlefonts = 'googlefonts' in opts

  if ('num-fonts' in opts) {
    numFonts = parseInt(opts['num-fonts'] as string)
  }
  if ('slice-size' in opts) {
    sliceSize = parseInt(opts['slice-size'] as string)
  }
  if ('filter' in opts) {
    filterFile = opts['filter'] as string
  }
  // --lite mode limits to only 1x scale font preview generation, for a selection of fonts.
  // Font filter list curated by [Typewolf](https://www.typewolf.com/google-fonts),
  //  adding some of the extras in the article's FAQ for flavour, plus some of the most popular
  //  Google fonts to make it 75.
  lite = 'lite' in opts
  if (lite) {
    googlefonts = true
    sliceSize = 15
    numFonts = 75
    filterFile = './75-google-fonts.txt'
  }

  println('Start building font previews at ' + new Date().toLocaleString() + ' ...')
  println('Script called with options:')
  println(JSON.stringify(opts, null, 2))

  let fonts: DownloadedFont[] = []
  let outpath: string

  if (googlefonts) {
    println('Downloading and building previews for all Google fonts ...')
    const apiKeyFile = __dirname + '/GOOGLE_API_KEY'
    const apiKey: string = fs.existsSync(apiKeyFile) ? fs.readFileSync(apiKeyFile)?.toString()?.trim() : ''
    if (apiKey.length < 20) {
      throw new Error(
        'Invalid api key - get an api key for google fonts and put it in a file called GOOGLE_API_KEY (or hardcode it in buildFontPreviews.ts)'
      )
    }
    fonts = await GoogleFonts.fetchAll(
      apiKey,
      __dirname + '/../font-cache',
      numFonts,
      noReplaceOldFontInfos,
      filterFile ? __dirname + '/' + filterFile : undefined
    )
    outpath = __dirname + '/../font-preview'
  } else {
    println('Building manual font previews ...')
    // Arguments like:
    // ts-node buildFontPreviews.ts manual-fonts-outdir "FontName|sans-serif|0,400+0,700+1,400+1,700|/path/to/font.ttf" "Font2|serif|0,400|/path/to/font2.ttf"
    outpath = process.argv?.[2]
    const fontArgs = process.argv.slice(3)
    if (!isDir(path.basename(path.dirname(outpath)))) {
      throw new Error('Need outpath as first argument!')
    }
    if (!isDir(outpath)) {
      fs.mkdirSync(outpath)
    }
    const re = /^(.+)\|(.+)\|((?:[0,1],[0-9]{1,4}\+)*(?:[0,1],[0-9]{1,4}))\|(.+)$/
    for (const arg of fontArgs) {
      const matches = arg?.match(re)
      if (matches) {
        const fontName = matches[1]
        const fontCategory = matches[2]
        const fontVariants = matches[3].split('+')
        const fontFile = matches[4]
        if (fontFile.slice(-4) !== '.ttf') {
          throw new Error('Not a TTF file: ' + fontFile)
        } else if (!fs.existsSync(fontFile)) {
          throw new Error('File does not exist: ' + fontFile)
        }
        const fontFileSvg = fontFile.slice(0, fontFile.length - 4) + '.svg'
        const f: DownloadedFont = {
          name: fontName,
          category: fontCategory,
          localFile: fontFile,
          localFileSvg: fontFileSvg,
          variants: fontVariants,
        }
        fonts.push(f)
      }
    }
  }
  await FontPreviewBuilder.generatePreview(fonts, outpath, sliceSize)
  println('Done at ' + new Date().toLocaleString())
}

main()
