<template>
  <div :class="outerClasses">
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
    <div ref="activator" :class="activatorClasses"></div>
    <div ref="popout" tabindex="-1" :class="popoutClasses">
      <div
        :class="
          'mcfontpicker__option' + (i == selectedFontIndex ? ' selected' : '')
        "
        v-for="(font, i) in matchingFonts"
        v-bind:key="font.sane"
        @mousedown="e => onClick(font)"
      >
        <div :class="'font-preview-' + font.sane">
          <span style="display:none">{{ font.name }}</span>
        </div>
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
    noAutoHide: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      focused: false,
      fonts: [],
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
    activatorClasses() {
      let ret = ['mccolorpicker__activator']
      ret.push('font-preview-' + this.current.sane)
      return ret
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
    this.fonts = ifonts
    this.addListeners()
    this.handleNewValue(this.value)
  },
  beforeDestroy() {
    this.removeListeners()
  },
  methods: {
    handleNewValue(newValue) {
      this.setCurrentByName(newValue)
      this.typedSearch = this.searchContent = newValue
    },
    searchChanged(e) {
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
        if (preciseMatches.length == 1) {
          this.setCurrent(preciseMatches[0])
        } else if (this.matchingFonts.length > 0) {
          this.setCurrent(this.matchingFonts[0])
        } else {
          this.setCurrent(this.current)
        }
      } else if (e.key && e.key === 'ArrowDown') {
        e.preventDefault()
        if (this.selectedFontIndex < this.matchingFonts.length - 1) {
          this.selectedFontIndex++
          this.showSelectedFont()
        }
      } else if (e.key && e.key === 'ArrowUp') {
        e.preventDefault()
        if (this.selectedFontIndex > 0) {
          this.selectedFontIndex--
          this.showSelectedFont()
        }
      }
    },

    showSelectedFont(pos = 'nearest') {
      let selectedFont = this.matchingFonts[this.selectedFontIndex]
      this.searchContent = selectedFont.name
      let font = this.$refs['popout'].querySelector(
        '.font-preview-' + selectedFont.sane,
      )
      if (font) {
        font.scrollIntoView({ block: pos })
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
        this.showSelectedFont('center')
      }, 1)
    },
    hide() {
      this.focused = false
    },
    addListeners() {
      window.addEventListener('click', this.clickoutside, false)
    },

    removeListeners() {
      window.removeEventListener('click', this.clickoutside, false)
    },

    clickoutside(e) {
      if (this.$el.contains(e.target)) {
        //We handle this elsewhere
      } else {
        this.hide()
      }
    },
    setCurrent(newValue) {
      this.current = newValue
      this.typedSearch = this.searchContent = this.current.name
      this.$emit('input', this.current.name)
      this.$refs['input'].blur()
    },
    setCurrentByName(newName) {
      for (var i in this.fonts) {
        if (this.fonts[i].name == newName) {
          this.current = this.fonts[i]
          break
        }
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
}
.mcfontpicker__search:focus {
  opacity: 1;
}
.mcfontpicker__popout {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border: 1px solid;
  max-height: 200px;
  overflow-y: scroll;
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
.mcfontpicker__popout .mcfontpicker__option.selected,
.mcfontpicker__popout .mcfontpicker__option:hover {
  background: #6789ab;
}
</style>
