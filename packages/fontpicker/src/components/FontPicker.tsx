import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import fontInfos from '../../font-preview/fontInfo.json'
import '../../font-preview/font-previews.css'
import './FontPicker.css'

export interface FontPickerProps extends React.ComponentPropsWithoutRef<'div'> {
  defaultValue?: string
  noMatches?: string
  autoLoad?: boolean
  loaderOnly?: boolean
  loadAllVariants?: boolean
  loadFonts?: string[] | FontToVariant[] | string
  googleFonts?: string[] | Font[] | string
  fontCategories?: string[] | string
  localFonts?: Font[] | undefined

  // Callbacks to emit selected font
  fontVariants?: (fontVariants: FontToVariant) => void
  value?: (value: string) => void
}

export interface Font {
  category: string
  name: string
  sane: string
  cased: string
  variants: Variant[]
}

export interface FourFonts {
  regular?: number
  bold?: number
  italic?: number
  boldItalic?: number
}

export type Variant = FontVariant | string

export interface FontVariant {
  italic: boolean
  weight: number
}

export interface FontToVariant {
  fontName: string
  variants: Variant[]
}

export function toString(v: Variant) {
  if (typeof v === 'string') {
    return v
  }
  return (v.italic ? '1' : '0') + ',' + v.weight
}

const defaultFont: Font = {
  category: 'sans-serif',
  name: 'Open Sans',
  sane: 'open_sans',
  cased: 'open sans',
  variants: [
    '0,300',
    '0,400',
    '0,500',
    '0,600',
    '0,700',
    '0,800',
    '1,300',
    '1,400',
    '1,500',
    '1,600',
    '1,700',
    '1,800',
  ],
}

export default function FontPicker({
  defaultValue = 'Open Sans',
  noMatches = 'No matches',
  autoLoad = false,
  loaderOnly = false,
  loadAllVariants = false,
  loadFonts = '',
  googleFonts = 'all',
  fontCategories = 'all',
  localFonts = [],
  fontVariants,
  value,
  ...rest
}: FontPickerProps) {
  const [focused, setFocused] = useState(false)
  const [typedSearch, setTypedSearch] = useState(defaultValue)
  const [searchContent, setSearchContent] = useState(defaultValue)
  const [selectedFontIndex, setSelectedFontIndex] = useState(-1)
  const [prevLoadFonts, setPrevLoadFonts] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const popoutRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleLoadFont = () => {
    if (typeof loadFonts === 'string') {
      if (loadFonts !== '') {
        const fontNames = loadFonts.trim().split(',')
        fontNames?.forEach((fontName: string) => {
          if (!prevLoadFonts.includes(fontName)) {
            setPrevLoadFonts([...prevLoadFonts, fontName])
            loadFontByName(fontName)
          }
        })
      }
    } else {
      loadFonts.forEach((font: FontToVariant | string) => {
        const fontName = typeof font === 'string' ? font : font?.fontName
        if (!fontName) {
          return
        }
        if (!prevLoadFonts.includes(fontName)) {
          setPrevLoadFonts([...prevLoadFonts, fontName])
          if (typeof font === 'object' && font.variants) {
            loadFontByName(
              fontName,
              font.variants.map((v) => toString(v))
            )
          } else {
            loadFontByName(fontName)
          }
        }
      })
    }
  }

  // Dynamic refs to allow immediately updating highlighted state of selected font option in picker
  const fontPickerOptionsRef = useRef<Map<string, HTMLDivElement | null> | null>(null)

  const saveOptionsRef = (key: string) => (node: HTMLDivElement | null) => {
    const map = getOptionsRef()
    if (node) {
      map.set(key, node)
    } else {
      map.delete(key)
    }
  }

  const getOptionsRef = () => {
    if (!fontPickerOptionsRef.current) {
      fontPickerOptionsRef.current = new Map()
    }
    return fontPickerOptionsRef.current
  }

  const outerClasses = () => {
    const ret = ['fontpicker']
    return ret
  }

  const popoutClasses = () => {
    const ret = ['fontpicker__popout']
    if (focused) {
      ret.push('fontpicker__active')
    }
    return [...ret]
  }

  const previewClasses = () => {
    const ret = ['fontpicker__preview']
    ret.push('font-preview-' + current.sane)
    return [...ret]
  }

  const allGoogleFonts: Font[] = useMemo(() => {
    const ifonts: Font[] = []
    fontInfos.forEach((info: Omit<Font, 'cased'>) => {
      const font: Font = { ...info, cased: info.name.toLowerCase() }
      ifonts.push(font)
    })
    return [...ifonts]
  }, [])

  const fonts = useMemo(() => {
    let activeFonts: Font[]
    if (googleFonts === 'all') {
      activeFonts = [...allGoogleFonts]
    } else if (typeof googleFonts === 'string') {
      const fontNames = googleFonts
        .trim()
        .split(',')
        .map((v) => v.toLowerCase())
      activeFonts = [...allGoogleFonts.filter((a: Font) => fontNames.includes(a.cased))]
    } else {
      const fontNames = googleFonts.map((v) => {
        if (typeof v === 'string') {
          return v.toLowerCase()
        } else {
          return v.cased
        }
      })
      activeFonts = [...allGoogleFonts.filter((a: Font) => fontNames.includes(a.cased))]
    }
    localFonts.forEach((font: Font) => {
      activeFonts.push({
        category: font.category,
        name: font.name,
        cased: font.name.toLowerCase(),
        sane: font.name
          .replaceAll(' ', '_')
          .replaceAll(/[^a-zA-Z0-9-]/g, '')
          .toLowerCase(),
        variants: font.variants.map((v: Variant) => toString(v)),
      })
    })
    let activeFontsInCategory: Font[]
    if (fontCategories === 'all') {
      activeFontsInCategory = [...activeFonts]
    } else if (typeof fontCategories === 'string') {
      const newFontCategories: string[] = fontCategories
        .trim()
        .split(',')
        .map((v: string) => v.trim().toLowerCase())
      activeFontsInCategory = [...allGoogleFonts.filter((a: Font) => newFontCategories.includes(a.category))]
    } else {
      const newFontCategories = fontCategories.map((v) => v.toLowerCase())
      activeFontsInCategory = [...allGoogleFonts.filter((a: Font) => newFontCategories.includes(a.category))]
    }
    return [...activeFontsInCategory]
  }, [googleFonts, allGoogleFonts, localFonts, fontCategories])

  const matchingFonts = useMemo(() => {
    const search = typedSearch.toLowerCase().trim()
    return fonts.filter((a) => a.cased.includes(search))
  }, [typedSearch, fonts])

  const cancelBlur = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const searchChanged = (e: React.FormEvent<HTMLInputElement>) => {
    if (popoutRef?.current?.scrollTop) {
      popoutRef.current.scrollTop = 0
    }
    const newValue = e.currentTarget?.value
    setSelectedFontIndex(-1)
    const isLonger = typedSearch.length < newValue?.length
    setTypedSearch(newValue)

    if (!isLonger) {
      //Don't autocomplete when using backspace
      setSearchContent(newValue)
      return
    }

    const cased = newValue.toLowerCase()

    const matches = fonts.filter((a) => a.cased.startsWith(cased))
    if (matches?.length) {
      const firstMatch = matches[0].name
      if (e.currentTarget) {
        e.currentTarget.value = firstMatch
      }
      setInputSelection(e.currentTarget, newValue.length, firstMatch.length)
      setSearchContent(firstMatch)
    } else {
      setSearchContent(newValue)
    }
  }

  const setInputSelection = (input: EventTarget & HTMLInputElement, startPos: number, endPos: number) => {
    if (input.setSelectionRange) {
      input.setSelectionRange(startPos, endPos)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key && e.key === 'Enter') {
      const cased = searchContent.toLowerCase()
      const preciseMatches = fonts.filter((a) => a.cased === cased)
      if (selectedFontIndex > -1) {
        setCurrent(matchingFonts[selectedFontIndex])
      } else if (preciseMatches.length === 1) {
        setCurrent(preciseMatches[0])
      } else if (matchingFonts.length > 0) {
        setCurrent(matchingFonts[0])
      } else {
        setCurrent(current)
      }
    } else if (e.key && e.key === 'ArrowDown') {
      e.preventDefault()
      if (selectedFontIndex < matchingFonts.length - 1) {
        setSearchContent(typedSearch)
        const prevSelectedFontIndex = selectedFontIndex
        setSelectedFontIndex((prev) => prev + 1)
        showSelectedFont('key', prevSelectedFontIndex + 1)
      }
    } else if (e.key && e.key === 'ArrowUp') {
      e.preventDefault()
      if (selectedFontIndex > 0) {
        setSearchContent(typedSearch)
        const prevSelectedFontIndex = selectedFontIndex
        setSelectedFontIndex((prev) => prev - 1)
        showSelectedFont('key', prevSelectedFontIndex - 1)
      }
    } else if (e.key && e.key === 'Escape') {
      hide()
    }
  }

  const showSelectedFont = (why = 'key', index = selectedFontIndex) => {
    const popout = popoutRef?.current
    if (popout && index >= 0) {
      const selectedFont = matchingFonts[index]
      // selectedFont should be undefined IFF fontCategories is changed and the currently
      //  selectedFont is not in the new category.
      if (selectedFont) {
        const fontElement = popout.querySelector('.font-preview-' + selectedFont.sane) as HTMLElement
        if (fontElement && fontElement instanceof HTMLElement) {
          const fontTop = fontElement.offsetTop
          const fontBottom = fontTop + fontElement.offsetHeight
          const popTop = popout.scrollTop
          const popBottom = popTop + popout.clientHeight
          if (why === 'opening' || fontTop <= popTop) {
            popout.scrollTop = fontTop
            fontElement.parentElement?.classList.add('selected')
            const optionRef = getOptionsRef()?.get(selectedFont.sane)
            optionRef?.classList.add('selected')
          } else if (fontBottom >= popBottom) {
            popout.scrollTop = fontBottom - popout.clientHeight - 1
          }
        }
      }
    }
  }

  const onFocus = () => {
    inputRef?.current?.select()
    setTypedSearch('')
    show()
  }

  const onClick = (font: Font) => {
    setCurrent(font)
    hide()
  }

  const show = () => {
    if (!focused) {
      setFocused(true)
      setTimeout(() => {
        let newSelectedFontIndex = selectedFontIndex
        for (const [i, font] of matchingFonts.entries()) {
          if (font.name === current.name) {
            newSelectedFontIndex = i
            setSelectedFontIndex(i)
            break
          }
        }
        setSearchContent(current.name)
        showSelectedFont('opening', newSelectedFontIndex)
      }, 1)
    }
  }

  const hide = () => {
    inputRef?.current?.blur()
    setFocused(false)
  }

  const getFontByName = useCallback(
    (name: string) => {
      let found: Font | null = null
      fonts.forEach((font) => {
        if (font.name === name.trim()) {
          found = font
        }
      })
      return found
    },
    [fonts]
  )

  const setCurrent = (font: Font) => {
    setCurrentState(font)
    setTypedSearch(font.name)
    setSearchContent(font.name)
    inputRef?.current?.blur()
    autoLoadFont(font)
    emitFontVariants(font)
    emitValue(font)
  }

  const emitFontVariants = useCallback(
    (font: Font) => {
      if (font?.name && font?.variants) {
        fontVariants?.({
          fontName: font.name,
          variants: font.variants,
        })
      }
    },
    [fontVariants]
  )

  const emitValue = useCallback(
    (font: Font) => {
      if (font?.name) {
        value?.(font.name)
      }
    },
    [value]
  )

  const loadFontFromObject = useCallback(
    (font: Font, variants: Variant[] = []) => {
      if (variants?.length > 0) {
        variants = font.variants.filter((v: Variant) => variants.includes(v))
      } else if (loadAllVariants) {
        variants = font.variants
      } else {
        variants = getFourVariants(font.variants.map((v) => toString(v)))
      }

      let cssId = 'google-font-' + font.sane
      const cssIdAll = cssId + '-all'
      if (variants.length === font.variants.length) {
        cssId = cssIdAll
      } else {
        cssId += '-' + variants.sort().join('-').replaceAll('1,', 'i').replaceAll('0,', '')
      }

      const existing = document.getElementById(cssId)
      const existingAll = document.getElementById(cssIdAll)
      if (!existing && !existingAll && font?.name && variants?.length > 0) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.id = cssId
        link.href =
          'https://fonts.googleapis.com/css2?family=' +
          font.name +
          ':ital,wght@' +
          variants.sort().join(';') +
          '&display=swap'
        link.setAttribute('data-testid', cssId) // for react testing library
        document.getElementsByTagName('head')[0].appendChild(link)
      }
    },
    [loadAllVariants]
  )

  const autoLoadFont = useCallback(
    (font: Font) => {
      if (autoLoad) {
        loadFontFromObject(font)
      }
    },
    [autoLoad, loadFontFromObject]
  )

  const loadFontByName = (font: string | Font, variants: Variant[] = []) => {
    if (font === '') {
      return
    }
    let loaded: string | Font | null = font
    if (typeof font === 'string') {
      loaded = getFontByName(font)
    }
    if (loaded === null || typeof loaded !== 'object' || typeof loaded.sane !== 'string') {
      console.error('Unknown font', font)
    } else if (loaded.variants.length < 1) {
      console.error('No valid variants of font', variants)
    } else {
      loadFontFromObject(loaded, variants)
    }
  }

  const getFourVariants = (variants: string[]) => {
    const regularWeights = variants
      .filter((v: string) => v.substring(0, 2) === '0,')
      .map((v: string) => parseInt(v.substring(2)))
      .sort((a, b) => a - b)
    const italicWeights = variants
      .filter((v: string) => v.substring(0, 2) === '1,')
      .map((v: string) => parseInt(v.substring(2)))
      .sort((a, b) => a - b)

    const fourFonts: FourFonts = {}

    // Best regular font is whatever is closest to 400 (but use 300 if only 300 and 500 available)
    fourFonts.regular = regularWeights.sort((a, b) => Math.abs(399 - a) - Math.abs(399 - b)).shift()

    // Best bold font is whatever is larger than regular, and closest to 700
    fourFonts.bold = regularWeights
      .filter((v) => v > (fourFonts.regular || 0))
      .sort((a, b) => Math.abs(700 - a) - Math.abs(700 - b))
      .shift()

    // Same for italics
    fourFonts.italic = italicWeights.sort((a, b) => Math.abs(399 - a) - Math.abs(399 - b)).shift()
    fourFonts.boldItalic = italicWeights
      .filter((v) => v > (fourFonts.italic || 0))
      .sort((a, b) => Math.abs(700 - a) - Math.abs(700 - b))
      .shift()

    const fourVariants: string[] = []
    if (fourFonts.regular) {
      fourVariants.push('0,' + fourFonts.regular)
    }
    if (fourFonts.bold) {
      fourVariants.push('0,' + fourFonts.bold)
    }
    if (fourFonts.italic) {
      fourVariants.push('1,' + fourFonts.italic)
    }
    if (fourFonts.boldItalic) {
      fourVariants.push('1,' + fourFonts.boldItalic)
    }
    return fourVariants
  }

  const defaultCurrent = getFontByName(defaultValue) || defaultFont
  const [current, setCurrentState] = useState<Font>(defaultCurrent)

  handleLoadFont()

  useEffect(() => {
    autoLoadFont(defaultCurrent)
    emitFontVariants(defaultCurrent)
    emitValue(defaultCurrent)
  }, [defaultCurrent])

  return (
    <>
      {!loaderOnly && (
        <div className={outerClasses()?.join(' ')} {...rest}>
          <div ref={previewRef} className={previewClasses()?.join(' ')} />
          <input
            className={'fontpicker__search'}
            ref={inputRef}
            type="text"
            onInput={searchChanged}
            onFocus={onFocus}
            onBlur={hide}
            onKeyDown={onKeyDown}
            value={searchContent}
          />
          <div //
            ref={popoutRef}
            tabIndex={-1}
            className={popoutClasses()?.join(' ')}
            onMouseDown={cancelBlur}
          >
            {matchingFonts.map((font, i) => (
              <div
                ref={saveOptionsRef(font.sane)}
                key={font.sane + i}
                className={'fontpicker__option' + (i === selectedFontIndex ? ' selected' : '')}
                onMouseDown={() => onClick(font)}
                onMouseMove={() => {
                  setSelectedFontIndex(i)
                }}
              >
                <div className={'font-preview-' + font.sane} />
              </div>
            ))}
            {matchingFonts.length === 0 && <div className={'fontpicker__nomatches'}>{noMatches}</div>}
          </div>
        </div>
      )}
    </>
  )
}
