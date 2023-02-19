import { useState } from 'react'
import FontPicker, { FontVariantMap } from './FontPicker'
import cs from './App.module.css'

export default function App() {
  const [font1, setFont1] = useState('')
  const [font2, setFont2] = useState('Open Sans')
  const [font3, setFont3] = useState('Open Sans')
  const [fontVariants, setFontVariants] = useState<FontVariantMap>()
  const fontCategories = 'sans-serif'
  const manuallyLoadFonts1 = ''
  const manuallyLoadFonts2 = ''
  const thinnestFont = ''
  const manuallyAddFontValue = 'Tinos'

  return (
    <>
      <div id={cs.app}>
        <h1>Google font picker for React</h1>
        <p>This is a live demo showing how to use react-fontpicker.</p>
        <p>
          See <a href="https://github.com/ae9is/react-fontpicker#readme">github repo</a> or{' '}
          <a href="https://www.npmjs.com/package/react-fontpicker">npm package</a> for installation instructions.
        </p>
        <div id={cs.toc}>
          <h3>TOC</h3>
          <ul>
            <li>
              <a href="#default">Default behaviour</a>
            </li>
            <li>
              <a href="#fontvariants">Font variants</a>
            </li>
            <li>
              <a href="#nomatches">No matches</a>
            </li>
            <li>
              <a href="#autoload">Autoload fonts</a>
            </li>
            <li>
              <a href="#manualload">Manually load fonts</a>
            </li>
            <li>
              <a href="#loadallvariants">Load all variants</a>
            </li>
            <li>
              <a href="#loadspecific">Load specific variants</a>
            </li>
            <li>
              <a href="#loaderonly">Font loader only</a>
            </li>
            <li>
              <a href="#choosegooglefonts">Choose google fonts</a>
            </li>
            <li>
              <a href="#fontcategories">Filter font categories</a>
            </li>
            <li>
              <a href="#manuallyadd">Manually add fonts</a>
            </li>
          </ul>
        </div>
        <h3 id="default">Default behaviour</h3>
        <p>
          By default the fontpicker is <strong>only</strong> a picker. The selected font is not loaded. (Font previews
          are pre-built into the picker.)
        </p>
        <div className={cs.example}>
          <FontPicker defaultValue="Audiowide" value={(font1: string) => setFont1(font1)} />
        </div>
        <p>Current value: {font1}</p>
        <pre>{"<FontPicker defaultValue={'Audiowide'} value={(font1: string) => setFont1(font1)} />"}</pre>
        <h3 id="fontvariants">Font variants</h3>
        <p>
          On mount and when a new font is selected the <code>fontVariants</code> callback is triggered. The main
          difference from the <code>value</code> callback is that it provides details about available variants of the
          current font.
        </p>
        <div className={cs.example}>
          <FontPicker
            defaultValue="Mountains of Christmas"
            fontVariants={(variants: FontVariantMap) => {
              setFontVariants(variants)
            }}
          />
        </div>
        <p>fontVariants:</p>
        <pre>{fontVariants?.variants?.join('\n') ?? 'None'}</pre>
        <pre>
          {`<FontPicker defaultValue="Mountains of Christmas" fontVariants={(variants: FontVariantMap) => { setFontVariants(variants) }} />
<pre>{fontVariants?.variants?.join('\\n') ?? 'None'}</pre>
`}
        </pre>

        <h3 id="nomatches">No matches</h3>
        <p>
          Customize the message when autocomplete yields no results using the <code>noMatches</code> prop.
        </p>
        <div className={cs.example}>
          <FontPicker noMatches="I've got nothing" />
        </div>
        <pre>{'<FontPicker noMatches="I\'ve got nothing" />'}</pre>

        <h3 id="autoload">Autoload fonts</h3>
        <p>
          Automatically load fonts by setting the <code>autoLoad</code> prop.
        </p>
        <div className={cs.example}>
          <FontPicker autoLoad defaultValue="Rock Salt" value={(font2: string) => setFont2(font2)} />
        </div>
        <p>
          Current value: <span style={{ fontFamily: font2 }}>{font2}</span>
        </p>
        <pre>{`<FontPicker autoLoad defaultValue="Rock Salt" value={(font2: string) => setFont2(font2)} />
<p>Current value: <span style={{ fontFamily: font2 }}>{font2}</span></p>`}</pre>
        <p>This works by injecting a stylesheet link in the current document to:</p>
        <pre>
          {"https://fonts.googleapis.com/css2?family=${font.name}:ital,wght@${variants.sort().join(';')}&display=swap"}
        </pre>
        <p>For example:</p>
        <pre>{`<link rel="stylesheet" id="google-font-open_sans-all" href="https://fonts.googleapis.com/css2?family=Open Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&amp;display=swap">`}</pre>

        <h3 id="manualload">Manually load fonts</h3>
        <p>TODO...</p>
        {/*
        <p>Manually load fonts by setting the <code>load-fonts</code>-prop.</p>
        <p>Several fonts may be loaded by comma-separating the names.</p>
        <div className={cs.example}>
          <FontPicker :load-fonts="manuallyLoadFonts1" />
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
    &lt;FontPicker :load-fonts="manuallyLoadFonts1" />
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
        <div className={cs.example}>
          <FontPicker auto-load load-all-variants v-model="font3" />
        </div>
        <p>
          Current value: <span :style="'font-family: ' + font3">{font3}</span>
        </p>
        <pre v-pre>
    &lt;FontPicker auto-load load-all-variants v-model="font3" />
    Current value: &lt;span :style="'font-family: ' + font3">{font3}&lt;/span>
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
        <div className={cs.example}>
          <FontPicker
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
            {thinnestFont.font}
          </span>
        </p>
        <pre v-pre>
    &lt;FontPicker
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
      {thinnestFont.font}
    &lt;/span>
    </pre
        >

        <h3 id="loaderonly">Font loader only</h3>
        <p>
          Set the <code>loader-only</code>-prop to completely hide the font picker
          if you just need to load one or more fonts.
        </p>
        <div className={cs.example}>
          <FontPicker :load-fonts="manuallyLoadFonts2" loader-only />
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
    &lt;FontPicker :load-fonts="manuallyLoadFonts2" loader-only />
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
        <div className={cs.example}>
          <FontPicker :google-fonts="['Tinos', 'Open Sans']" />
        </div>
        <pre>&lt;FontPicker :google-fonts="['Tinos', 'Open Sans']" /></pre>

        <h3 id="fontcategories">Filter font categories</h3>
        <p>
          You can filter the fonts by category using the
          <code>font-categories</code>-prop.
        </p>
        <p>
          You can supply category names as an array or as a comma-seperated string.
        </p>
        <div className={cs.example}>
          <select v-model="fontCategories">
            <option value="all">All</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="display">Display</option>
            <option value="handwriting">Handwriting</option>
            <option value="monospace">Monospace</option>
            <option value="display, serif">display, serif</option>
            <option :value="['display', 'handwriting']">
              ['display', 'handwriting']
            </option>
          </select>
          <FontPicker :font-categories="fontCategories" />
        </div>
        <pre>
    &lt;select v-model="fontCategories">
      &lt;option value="all">All&lt;/option>
      &lt;option value="serif">Serif&lt;/option>
      &lt;option value="sans-serif">Sans-serif&lt;/option>
      &lt;option value="display">Display&lt;/option>
      &lt;option value="handwriting">Handwriting&lt;/option>
      &lt;option value="monospace">Monospace&lt;/option>
      &lt;option value="display, serif">display, serif&lt;/option>
      &lt;option :value="['display', 'handwriting']">
        ['display', 'handwriting']
      &lt;/option>
    &lt;/select>
    &lt;FontPicker :font-categories="fontCategories" />
        </pre>

        <h3 id="manuallyadd">Manually add fonts</h3>
        <p>Manually add fonts using the <code>local-fonts</code>-prop.</p>
        <p>
          You need to provide your own styling of the previews, how to create this
          is again beyond the scope of this document for now. Local fonts are also
          not auto-loaded, so depending on use case you may need to handle that too.
        </p>
        <div className={cs.example}>
          <FontPicker
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
            {manuallyAddFontValue}
          </span>
        </p>
        <pre>
          &lt;FontPicker
            v-model="manuallyAddFontValue"
            :google-fonts="['Tinos', 'Open Sans']"
            :local-fonts="[
              {
                name: 'BickleyScript',
                variants: [{ italic: false, weight: 400 }, '1,400' ],
              },
            ]"
        /&gt;
        Current value:
        &lt;span style='{ fontFamily: manuallyAddFontValue, }'&gt;
          {manuallyAddFontValue}
        &lt;/span&gt;</pre>

      */}
      </div>
    </>
  )
}
