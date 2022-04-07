<template>
  <div :class="outerClasses" v-if="!loaderOnly">
    <input
      ref="input"
      type="text"
      @input="searchChanged"
      @focus="onFocus"
      @blur="hide"
      @keydown="onKeyDown"
      class="mcfontpicker__search"
      :value="searchContent"
    />
    <div ref="preview" :class="previewClasses"></div>
    <div
      ref="popout"
      tabindex="-1"
      :class="popoutClasses"
      @mousedown="cancelBlur"
    >
      <div
        :class="
          'mcfontpicker__option' + (i == selectedFontIndex ? ' selected' : '')
        "
        v-for="(font, i) in matchingFonts"
        v-bind:key="font.sane"
        @mousedown="e => onClick(font)"
        @mousemove="() => (selectedFontIndex = i)"
      >
        <div :class="'font-preview-' + font.sane" />
      </div>
      <div v-if="matchingFonts.length == 0" class="mcfontpicker__nomatches">
        {{ noMatches }}
      </div>
    </div>
    <!--pre>{{ focused }}</pre-->
  </div>
</template>

<script>
import fonts from '../../font-preview/fontInfo.json'
import '../../font-preview/font-previews.css'

export default {
  props: {
    value: {
      type: [String],
      default: 'Open Sans',
    },
    noMatches: {
      type: [String],
      default: 'No matches',
    },
    autoLoad: {
      type: Boolean,
      default: false,
    },
    loaderOnly: {
      type: Boolean,
      default: false,
    },
    loadAllVariants: {
      type: Boolean,
      default: false,
    },
    loadFonts: {
      type: [Array, String],
      default: '',
    },
    googleFonts: {
      type: [Array, String],
      default: () => 'all',
    },
    localFonts: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      focused: false,
      allGoogleFonts: [],
      typedSearch: '',
      searchContent: '',
      selectedFontIndex: -1,
      current: {
        name: 'Open Sans',
        sane: 'open-sans',
      },
    }
  },
  watch: {
    value(newValue) {
      this.handleNewValue(newValue)
    },
    loadFonts(newValue) {
      this.handleLoadFont()
    },
  },
  computed: {
    outerClasses() {
      let ret = [
        'mcfontpicker', //
      ]
      return ret
    },
    popoutClasses() {
      let ret = ['mcfontpicker__popout']
      if (this.focused) {
        ret.push('mcfontpicker__active')
      }
      return ret
    },
    previewClasses() {
      let ret = ['mcfontpicker__preview']
      ret.push('font-preview-' + this.current.sane)
      return ret
    },
    fonts() {
      let activeFonts

      if (this.googleFonts == 'all') {
        activeFonts = [...this.allGoogleFonts]
      } else if (typeof this.googleFonts === 'string') {
        let fontNames = this.googleFonts.split(',').map(v => v.toLowerCase())
        activeFonts = [...this.allGoogleFonts.filter(a => fontNames.includes(a.cased))]
      } else {
        let fontNames = this.googleFonts.map(v => v.toLowerCase())
        activeFonts = [...this.allGoogleFonts.filter(a => fontNames.includes(a.cased))]
      }

      for (var i in this.localFonts) {
        activeFonts.push({
          name: this.localFonts[i].name,
          cased: this.localFonts[i].name.toLowerCase(),
          sane: this.localFonts[i].name
            .replaceAll(' ', '_')
            .replaceAll(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase(),
          variants: this.localFonts[i].variants.map(v => {
            if (typeof v === 'string') {
              return v
            }
            return (v.italic ? '1' : '0') + ',' + v.weight
          }),
        })
      }
      return activeFonts
    },
    matchingFonts() {
      let search = this.typedSearch.toLowerCase().trim()
      return this.fonts.filter(a => a.cased.includes(search))
    },
  },
  mounted() {
    let ifonts = []
    for (var i in fonts) {
      let font = fonts[i]
      font.cased = font.name.toLowerCase()
      ifonts.push(font)
    }
    this.allGoogleFonts = ifonts
    this.handleNewValue(this.value)

    this.handleLoadFont()
  },
  methods: {
    cancelBlur(e) {
      e.preventDefault()
    },
    handleNewValue(newValue) {
      this.setCurrentByName(newValue)
      this.typedSearch = this.searchContent = newValue
    },
    handleLoadFont() {
      if (typeof this.loadFonts === 'string') {
        let fontNames = this.loadFonts.split(',')
        for (var i in fontNames) {
          this.loadFontByName(fontNames[i])
        }
      } else {
        for (i in this.loadFonts) {
          let font = this.loadFonts[i]
          if (!font.font) {
            continue
          }
          if (font.variants) {
            this.loadFontByName(
              font.font,
              font.variants.map(v => (v.italic ? '1' : '0') + ',' + v.weight),
            )
          } else {
            this.loadFontByName(font.font)
          }
        }
      }
    },
    searchChanged(e) {
      this.$refs['popout'].scrollTop = 0
      this.selectedFontIndex = -1
      let isLonger = this.typedSearch.length < e.target.value.length
      this.typedSearch = e.target.value

      if (!isLonger) {
        //Don't autocomplete when using backspace
        this.searchContent = e.target.value
        return
      }

      let cased = this.typedSearch.toLowerCase()

      let matches = this.fonts.filter(a => a.cased.startsWith(cased))
      if (matches.length) {
        let firstMatch = matches[0].name
        this.searchContent = firstMatch
        e.target.value = firstMatch
        this.setInputSelection(
          e.target,
          this.typedSearch.length,
          this.searchContent.length,
        )
      } else {
        this.searchContent = e.target.value
      }
    },
    setInputSelection(input, startPos, endPos) {
      if (input.setSelectionRange) {
        input.setSelectionRange(startPos, endPos)
      } else if (input.createTextRange) {
        var range = input.createTextRange()
        range.collapse(true)
        range.moveEnd('character', endPos)
        range.moveStart('character', startPos)
        range.select()
      }
    },

    onKeyDown(e) {
      if (e.key && e.key === 'Enter') {
        let cased = this.searchContent.toLowerCase()
        let preciseMatches = this.fonts.filter(a => a.cased == cased)
        if (this.selectedFontIndex > -1) {
          this.setCurrent(this.matchingFonts[this.selectedFontIndex])
        } else if (preciseMatches.length == 1) {
          this.setCurrent(preciseMatches[0])
        } else if (this.matchingFonts.length > 0) {
          this.setCurrent(this.matchingFonts[0])
        } else {
          this.setCurrent(this.current)
        }
      } else if (e.key && e.key === 'ArrowDown') {
        e.preventDefault()
        if (this.selectedFontIndex < this.matchingFonts.length - 1) {
          this.searchContent = this.typedSearch
          this.selectedFontIndex++
          this.showSelectedFont()
        }
      } else if (e.key && e.key === 'ArrowUp') {
        e.preventDefault()
        if (this.selectedFontIndex > 0) {
          this.searchContent = this.typedSearch
          this.selectedFontIndex--
          this.showSelectedFont()
        }
      }
    },

    showSelectedFont(why = 'key') {
      let selectedFont = this.matchingFonts[this.selectedFontIndex]
      let font = this.$refs['popout'].querySelector(
        '.font-preview-' + selectedFont.sane,
      )
      if (font) {
        let fontTop = font.offsetTop
        let fontBottom = fontTop + font.offsetHeight
        let popTop = this.$refs['popout'].scrollTop
        let popBottom = popTop + this.$refs['popout'].clientHeight
        if (why == 'opening' || fontTop <= popTop) {
          this.$refs['popout'].scrollTop = fontTop
        } else if (fontBottom >= popBottom) {
          this.$refs['popout'].scrollTop =
            fontBottom - this.$refs['popout'].clientHeight - 1
        }
      }
    },

    onFocus() {
      this.$refs['input'].select()
      this.typedSearch = ''
      this.show()
    },
    onClick(font) {
      this.setCurrent(font)
      this.hide()
    },
    show() {
      this.focused = true
      setTimeout(() => {
        for (var i in this.matchingFonts) {
          if (this.matchingFonts[i].name == this.current.name) {
            this.selectedFontIndex = i
            break
          }
        }
        this.searchContent = this.current.name
        this.showSelectedFont('opening')
      }, 1)
    },
    hide() {
      this.focused = false
    },
    getFontByName(name) {
      for (var i in this.fonts) {
        if (this.fonts[i].name == name.trim()) {
          return this.fonts[i]
        }
      }
      return null
    },
    setCurrent(newValue) {
      this.current = newValue
      this.typedSearch = this.searchContent = this.current.name
      this.$emit('input', this.current.name)
      this.$refs['input'].blur()
      this.autoLoadFont()
      this.emitFontVariants()
    },
    setCurrentByName(newName) {
      let font = this.getFontByName(newName)
      if (font) {
        this.current = font
        this.autoLoadFont()
        this.emitFontVariants()
      }
    },
    emitFontVariants() {
      this.$emit('fontVariants', {
        font: this.current.name,
        variants: this.current.variants.map(v => {
          return {
            italic: v.substring(0, 2) == '1,',
            weight: v.substring(2),
          }
        }),
      })
    },
    autoLoadFont(font) {
      if (this.autoLoad) {
        this.loadFontFromObject(this.current)
      }
    },
    loadFontByName(font, variants) {
      if (font === '') {
        return
      }
      let origFont = font
      if (typeof font == 'string') {
        font = this.getFontByName(font)
      }
      if (
        font == null ||
        typeof font != 'object' ||
        typeof font.sane != 'string'
      ) {
        console.error('Unknown font', origFont)
      } else if (font.variants.length < 1) {
        console.error('No valid variants of font', variants)
      } else {
        this.loadFontFromObject(font, variants)
      }
    },
    getFourVariants(variants) {
      let regularWeights = variants
        .filter(v => v.substring(0, 2) == '0,')
        .map(v => parseInt(v.substring(2)))
        .sort((a, b) => a - b)
      let italicWeights = variants
        .filter(v => v.substring(0, 2) == '1,')
        .map(v => parseInt(v.substring(2)))
        .sort((a, b) => a - b)

      let fourFonts = {}

      // Best regular font is whatever is closest to 400 (but use 300 if only 300 and 500 available)
      fourFonts.regular = regularWeights
        .sort((a, b) => Math.abs(399 - a) - Math.abs(399 - b))
        .shift()

      // Best bold font is whatever is larger than regular, and closest to 700
      fourFonts.bold = regularWeights
        .filter(v => v > fourFonts.regular)
        .sort((a, b) => Math.abs(700 - a) - Math.abs(700 - b))
        .shift()

      // Same for italics
      fourFonts.italic = italicWeights
        .sort((a, b) => Math.abs(399 - a) - Math.abs(399 - b))
        .shift()
      fourFonts.boldItalic = italicWeights
        .filter(v => v > fourFonts.italic)
        .sort((a, b) => Math.abs(700 - a) - Math.abs(700 - b))
        .shift()

      let loadFonts = []
      if (fourFonts.regular) {
        loadFonts.push('0,' + fourFonts.regular)
      }
      if (fourFonts.bold) {
        loadFonts.push('0,' + fourFonts.bold)
      }
      if (fourFonts.italic) {
        loadFonts.push('1,' + fourFonts.italic)
      }
      if (fourFonts.boldItalic) {
        loadFonts.push('1,' + fourFonts.boldItalic)
      }
      return loadFonts
    },
    loadFontFromObject(font, variants) {
      if (variants) {
        variants = font.variants.filter(v => variants.includes(v))
      } else if (this.loadAllVariants) {
        variants = font.variants
      } else {
        variants = this.getFourVariants(font.variants)
      }

      let cssId = 'google-font-' + font.sane
      let cssIdAll = cssId + '-all'
      if (variants.length == font.variants.length) {
        cssId = cssIdAll
      } else {
        cssId +=
          '-' +
          variants
            .sort()
            .join('-')
            .replaceAll('1,', 'i')
            .replaceAll('0,', '')
      }

      let existing = document.getElementById(cssId)
      let existingAll = document.getElementById(cssIdAll)
      if (!existing && !existingAll) {
        var link = document.createElement('link')
        link.rel = 'stylesheet'
        link.id = cssId
        link.href =
          'https://fonts.googleapis.com/css2?family=' +
          font.name +
          ':ital,wght@' +
          variants.sort().join(';') +
          '&display=swap'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
    },
  },
}
</script>

<style>
.mcfontpicker,
.mcfontpicker * {
  box-sizing: border-box;
}
.mcfontpicker {
  border: 1px solid;
  display: block;
  position: relative;
}
.mcfontpicker__search {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  padding: 0 10px;
  cursor: pointer;
  font-size: 16px;
}
.mcfontpicker__search:focus {
  cursor: text;
  opacity: 1;
}
.mcfontpicker__popout {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border: 1px solid;
  max-height: calc(12em + 1px);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 2;
  background: #fff;
  opacity: 0;
  transform: scaleY(0.001);
}
.mcfontpicker__popout.mcfontpicker__active {
  opacity: 1;
  transform: scale(1);
}
.mcfontpicker__popout .mcfontpicker__option {
  background: #fff;
}
.mcfontpicker__popout .mcfontpicker__option.selected {
  background: #6789ab;
}
.mcfontpicker__nomatches {
  height: 2em;
  line-height: 2em;
  background: #fff;
  text-align: center;
  color: #888;
}
</style>
