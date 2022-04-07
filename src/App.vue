<template>
  <div id="app">
    <h1>Simple google font picker</h1>
    <p>
      This is a live demo showing how to use @mikk3lro/mc-fontpicker for Vue.js.
    </p>
    <p>
      See
      <a href="https://github.com/Mikk3lRo/vue-fontpicker#readme"
        >github repo</a
      >
      or
      <a href="https://www.npmjs.com/package/@mikk3lro/mc-fontpicker"
        >npm package</a
      >
      for installation instructions.
    </p>

    <div id="toc">
      <h3>TOC</h3>
      <ul>
        <li><a href="#default">Default behaviour</a></li>
        <li><a href="#fontVariants">Font variants</a></li>
        <li><a href="#nomatches">No matches</a></li>
        <li><a href="#autoload">Autoload fonts</a></li>
        <li><a href="#manualload">Manually load fonts</a></li>
        <li><a href="#loadallvariants">Load all variants</a></li>
        <li><a href="#loadspecific">Load specific variants</a></li>
        <li><a href="#loaderonly">Font loader only</a></li>
        <li><a href="#choosegooglefonts">Choose google fonts</a></li>
        <li><a href="#manuallyadd">Manually add fonts</a></li>
      </ul>
    </div>

    <h3 id="default">Default behaviour</h3>
    <p>
      By default the fontpicker is <strong>only</strong> a picker. The selected
      font is not loaded.
    </p>
    <div class="example">
      <McFontpicker v-model="font1" />
    </div>
    <p>
      Current value: <span :style="'font-family: ' + font1">{{ font1 }}</span>
    </p>
    <pre v-pre>
&lt;McFontpicker v-model="font1" />
Current value: &lt;span :style="'font-family: ' + font1">{{ font1 }}&lt;/span>
</pre
    >

    <h3 id="fontVariants">Font variants</h3>
    <p>
      On mount and when a new font is selected the
      <code>fontVariants</code> event is triggered. The main difference from the
      <code>input</code> event is that it provides details about available
      variants of the current font.
    </p>
    <div class="example">
      <McFontpicker
        value="Oranienbaum"
        @fontVariants="i => (fontVariants = i)"
      />
    </div>
    <p>fontVariants:</p>
    <pre>{{ fontVariants }}</pre>
    <pre v-pre>
&lt;McFontpicker @fontVariants="i => (fontVariants = i)" />
fontVariants: &lt;pre>{{ fontVariants }}&lt;/pre>
</pre
    >

    <h3 id="nomatches">No matches</h3>
    <p>
      Customize the message when autocomplete yields no results using the
      <code>no-matches</code>-prop.
    </p>
    <div class="example">
      <McFontpicker ref="fontloader" no-matches="I've got nothing" />
    </div>
    <pre>&lt;McFontpicker no-matches="I've got nothing" /></pre>

    <h3 id="autoload">Autoload fonts</h3>
    <p>Automatically load fonts by setting the <code>auto-load</code>-prop.</p>
    <div class="example">
      <McFontpicker auto-load v-model="font2" />
    </div>
    <p>
      Current value: <span :style="'font-family: ' + font2">{{ font2 }}</span>
    </p>
    <pre v-pre>
&lt;McFontpicker auto-load v-model="font2" />
Current value: &lt;span :style="'font-family: ' + font2">{{ font2 }}&lt;/span>
</pre
    >

    <h3 id="manualload">Manually load fonts</h3>
    <p>Manually load fonts by setting the <code>load-fonts</code>-prop.</p>
    <p>Several fonts may be loaded by comma-separating the names.</p>
    <div class="example">
      <McFontpicker :load-fonts="manuallyLoadFonts1" />
      <div style="text-align: center">
        <button @click="manuallyLoadFonts1 = 'Rubik Beastly'">
          Load <span style="font-family: Rubik Beastly">"Rubik Beastly"</span>
        </button>
        <button @click="manuallyLoadFonts1 = 'Pacifico, Teko'">
          Load <span style="font-family: Pacifico">"Pacifico"</span> and
          <span style="font-family: Teko">"Teko"</span>
        </button>
      </div>
    </div>
    <pre>
&lt;McFontpicker :load-fonts="manuallyLoadFonts1" />
&lt;button @click="manuallyLoadFonts1 = 'Rubik Beastly'">One font&lt;/button>
&lt;button @click="manuallyLoadFonts1 = 'Pacifico, Teko'">Two fonts&lt;/button>
</pre
    >

    <h3 id="loadallvariants">Load all variants</h3>
    <p>
      By default only the four most common variants (regular, bold, italic and
      bold italic) are loaded. You can make sure all variants are loaded by
      setting the <code>load-all-variants</code> prop.
    </p>
    <div class="example">
      <McFontpicker auto-load load-all-variants v-model="font3" />
    </div>
    <p>
      Current value: <span :style="'font-family: ' + font3">{{ font3 }}</span>
    </p>
    <pre v-pre>
&lt;McFontpicker auto-load load-all-variants v-model="font3" />
Current value: &lt;span :style="'font-family: ' + font3">{{ font3 }}&lt;/span>
</pre
    >

    <h3 id="loadspecific">Load specific variants</h3>
    <p>
      The <code>load-fonts</code>-prop can also accept an array of objects
      specifying fonts and variants. Example:
    </p>
    <pre>
[
  {
    font: "Open Sans",
    variants: [
      { italic: false, weight: 400 },
      { italic: true, weight: 400 },
      { italic: false, weight: 700 },
      { italic: true, weight: 700 },
    ]
  },
  {
    font: "Rancho",
    variants: [
      { italic: false, weight: 400 },
    ]
  }
]</pre
    >
    <p>
      Note that many fonts exist only in a few variants, so make sure the
      variants you request actually exist. For instance by filtering the values
      emitted from <code>fontVariants</code> events.
    </p>
    <p>
      One use case could be loading only one variant - in this example whichever
      is first (least bold):
    </p>
    <div class="example">
      <McFontpicker
        :load-fonts="[thinnestFont]"
        @fontVariants="
          v =>
            (thinnestFont = {
              font: v.font,
              variants: v.variants.slice(0, 1),
            })
        "
      />
    </div>
    <p v-if="typeof thinnestFont == 'object'">
      Current value:
      <span
        :style="{
          fontFamily: thinnestFont.font,
          fontWeight: thinnestFont.variants[0].weight,
        }"
      >
        {{ thinnestFont.font }}
      </span>
    </p>
    <pre v-pre>
&lt;McFontpicker
  :load-fonts="[thinnestFont]"
  @fontVariants="
    v => (thinnestFont = {
      font: v.font,
      variants: v.variants.slice(0, 1),
    })
  "
/>
Current value:
&lt;span
  :style="{
    fontFamily: thinnestFont.font,
    fontWeight: thinnestFont.variants[0].weight,
  }"
>
  {{ thinnestFont.font }}
&lt;/span>
</pre
    >

    <h3 id="loaderonly">Font loader only</h3>
    <p>
      Set the <code>loader-only</code>-prop to completely hide the font picker
      if you just need to load one or more fonts.
    </p>
    <div class="example">
      <McFontpicker :load-fonts="manuallyLoadFonts2" loader-only />
      <div style="text-align: center">
        <button @click="manuallyLoadFonts1 = 'Rancho'">
          Load <span style="font-family: Rancho">"Rancho"</span>
        </button>
        <button @click="manuallyLoadFonts1 = 'Smooch, Risque'">
          Load <span style="font-family: Smooch">"Smooch"</span> and
          <span style="font-family: Risque">"Risque"</span>
        </button>
      </div>
    </div>
    <pre>
&lt;McFontpicker :load-fonts="manuallyLoadFonts2" loader-only />
&lt;button @click="manuallyLoadFonts2 = 'Rancho'">Rancho&lt;/button>
&lt;button @click="manuallyLoadFonts2 = 'Smooch, Risque'">Two fonts&lt;/button>
</pre
    >

    <h3 id="choosegooglefonts">Choose google fonts</h3>
    <p>
      You can limit the included google fonts using the
      <code>google-fonts</code>-prop.
    </p>
    <p>You can supply font names as an array or as a comma-seperated string.</p>
    <p>
      Do note that the previews are crazy inefficient if you only use a few
      fonts - in that case you are probably better off recompiling all previews
      - which is beyond the scope of this document at the moment.
    </p>
    <div class="example">
      <McFontpicker :google-fonts="['Tinos', 'Open Sans']" />
    </div>
    <pre>&lt;McFontpicker :google-fonts="['Tinos', 'Open Sans']" /></pre>

    <h3 id="manuallyadd">Manually add fonts</h3>
    <p>Manually add fonts using the <code>local-fonts</code>-prop.</p>
    <p>
      You need to provide your own styling of the previews, how to create this
      is again beyond the scope of this document for now. Local fonts are also
      not auto-loaded, so depending on use case you may need to handle that too.
    </p>
    <div class="example">
      <McFontpicker
        v-model="manuallyAddFontValue"
        :google-fonts="['Tinos', 'Open Sans']"
        :local-fonts="[
          {
            name: 'BickleyScript',
            variants: [
              {
                italic: false,
                weight: 400,
              },
              '1,400',
            ],
          },
        ]"
      />
    </div>
    <p v-if="typeof manuallyAddFontValue == 'string'">
      Current value:
      <span
        :style="{
          fontFamily: manuallyAddFontValue,
        }"
      >
        {{ manuallyAddFontValue }}
      </span>
    </p>
    <pre v-pre>
&lt;McFontpicker
  v-model="manuallyAddFontValue"
  :google-fonts="['Tinos', 'Open Sans']"
  :local-fonts="[
    {
      name: 'BickleyScript',
      variants: [{ italic: false, weight: 400, '1,400' }],
    },
  ]"
/>
Current value:
&lt;span
  :style="{
    fontFamily: manuallyAddFontValue,
  }"
>
  {{ manuallyAddFontValue }}
&lt;/span></pre
    >
  </div>
</template>

<script>
import McFontpicker from './components/index'
import '../manual-fonts-test/font-previews.css'

export default {
  name: 'App',
  components: {
    McFontpicker,
  },
  data() {
    return {
      font1: 'Tenor Sans',
      font2: 'Open Sans',
      font3: 'Open Sans',
      fontVariants: null,
      manuallyLoadFonts1: '',
      manuallyLoadFonts2: '',
      thinnestFont: '',
      manuallyAddFontValue: 'Tinos',
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 1em auto 160px auto;
  max-width: 600px;
  text-align: left;
  padding: 1em 0.5em;
  line-height: 1.6em;
}
* {
  vertical-align: baseline;
  box-sizing: border-box;
}
button {
  height: 3em;
  line-height: 1em;
  padding: 0.5em 1em;
  box-sizing: border-box;
  margin: 0.5em;
  width: 20em;
}
a {
  color: #379bff;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
#toc {
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.3);
  position: fixed;
  width: 220px;
  top: 40px;
  left: calc(50% - 550px);
  padding: 1em 0;
}
#toc li {
  padding: 0.2em 0.5em;
  margin: 0;
  text-align: center;
}
#toc h3 {
  border-bottom: 1px solid #888;
  margin: 0 0 0.5em 0;
  text-align: center;
}
#toc ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
@media screen and (max-width: 1100px) {
  #app {
    margin-left: 230px;
    max-width: none;
  }
  #toc {
    left: 0;
    top: 0;
    bottom: 0;
    transform: none;
  }
}
@media screen and (max-width: 600px) {
  #app {
    margin-left: auto;
  }
  #toc {
    display: none;
  }
}

h3 {
  margin-top: 50px;
  border-bottom: 3px solid #123456;
}

li {
  margin: 1em 0;
}

.example {
  text-align: center;
  position: relative;
}
.example.overflow {
  overflow: scroll;
  padding: 1em 0;
  border: 1px solid;
}
pre,
code {
  text-align: left;
  background: #eee;
}
table {
  margin: 0 auto;
  vertical-align: top;
  table-layout: fixed;
}
table th,
table td {
  vertical-align: top;
  padding: 0.5em;
  width: 45%;
}
table td:nth-child(2) {
  width: 10%;
  text-align: center;
}
table th {
  text-align: right;
  font-weight: normal;
}
table td {
  text-align: left;
}
table code {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
table pre,
table code {
  margin-top: 3px;
  display: inline-block;
  max-width: 100%;
}
.squarePreview {
  width: 100px;
  height: 2em;
}
.inputPreview {
  border: none;
  padding: 0;
  border-radius: 1em;
  height: 2em;
  text-align: center;
  width: 100px;
}
pre {
  padding: 0.5em;
  overflow-x: auto;
}
.initial-current {
  width: 100%;
}
.initial-current pre {
  width: 100%;
  margin: 0;
}
@media screen and (max-width: 500px) {
  .initial-current thead {
    display: none;
  }
  .initial-current th,
  .initial-current td,
  .initial-current tr {
    width: auto !important;
    display: block;
    text-align: center;
  }
  .initial-current th:first-child::before {
    content: 'Initial: ';
    display: block;
  }
  .initial-current td:last-child::before {
    content: 'Current: ';
    display: block;
  }
  .initial-current td:last-child {
    border-bottom: 1px solid #333;
  }
}
</style>
