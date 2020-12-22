import McFontpicker from './McFontpicker.vue'

function install(Vue) {
  if (install.installed) return
  install.installed = true
  Vue.component('McFontpicker', McFontpicker)
}

const plugin = {
  install,
}

let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}

McFontpicker.install = install

export default McFontpicker
