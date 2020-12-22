<template>
  <div :class="outerClasses">
    <div ref="activator" :class="activatorClasses" @click="toggle()"></div>
    <div ref="popout" :class="popoutClasses">
      <div
        class="mcfontpicker__option"
        v-for="font in fonts"
        v-bind:key="font.sane"
        @click="setCurrent(font)"
      >
        <div :class="'font-preview-' + font.sane">
          <span style="display:none">{{ font.name }}</span>
        </div>
      </div>
    </div>
    <!--pre>{{ shown }}</pre-->
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
      shown: false,
      fonts: fonts,
      current: {
        name: 'Open Sans',
        sane: 'open-sans',
      },
    }
  },
  watch: {
    value(newValue) {
      this.setCurrentByName(newValue)
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
      if (this.shown) {
        ret.push('mcfontpicker__active')
      }
      return ret
    },
    activatorClasses() {
      let ret = ['mccolorpicker__activator']
      ret.push('font-preview-' + this.current.sane)
      return ret
    },
  },
  mounted() {
    this.addListeners()
    this.setCurrentByName(this.value)
  },
  beforeDestroy() {
    this.removeListeners()
  },
  methods: {
    show() {
      this.shown = true
    },
    hide() {
      this.shown = false
    },
    hideIfAutohide() {
      if (!this.noAutoHide) {
        this.shown = false
      }
    },
    toggle() {
      if (this.shown) {
        this.hide()
      } else {
        this.show()
      }
    },
    addListeners() {
      window.addEventListener('click', this.clickoutside, false)
    },

    removeListeners() {
      window.removeEventListener('click', this.clickoutside, false)
    },

    clickoutside(e) {
      if (
        this.$refs['activator'] &&
        this.$refs['activator'].contains(e.target)
      ) {
        //We handle this elsewhere
      } else if (
        !this.$refs['popout'] ||
        !this.$refs['popout'].contains(e.target)
      ) {
        this.hideIfAutohide()
      }
    },
    setCurrent(newValue) {
      this.current = newValue
      this.$emit('input', this.current.name)
      this.hide()
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
  pointer-events: auto;
  transform: scaleY(0.001);
}
.mcfontpicker__popout.mcfontpicker__active {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}
.mcfontpicker__popout .mcfontpicker__option {

}
.mcfontpicker__popout .mcfontpicker__option:hover {
  background: #6789ab;
}
</style>
