import { useState } from 'react'
import '../../manual-fonts-test/font-previews.css'
import FontPicker, { FontToVariant } from './FontPicker'
import cs from './App.module.css'

export default function App() {
  const [font1, setFont1] = useState('')
  const [font2, setFont2] = useState('') // example has no fontVariants
  const [font3, setFont3] = useState('')
  const [thinnestFont, setThinnestFont] = useState<FontToVariant>() // basically, font4; subset of fontVariants4
  const [fontVariants, setFontVariants] = useState<FontToVariant>()
  const [fontVariants3, setFontVariants3] = useState<FontToVariant>()
  const [fontVariants4, setFontVariants4] = useState<FontToVariant>()
  const [fontCategories, setFontCategories] = useState<string | string[]>('sans-serif')
  const [manuallyLoadFonts1, setManuallyLoadFonts1] = useState('')
  const [manuallyLoadFonts2, setManuallyLoadFonts2] = useState('')
  const [manuallyAddFontValue, setManuallyAddFontValue] = useState('Tinos')
  const [inputFont, setInputFont] = useState('')
  const [outputFont, setOutputFont] = useState('')
  const [checkLoadedFont, setCheckLoadedFont] = useState('')
  const [fontToLoad, setFontToLoad] = useState<string | string[] | undefined>(undefined)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  return (
    <>
      <div id={cs.app}>
        <h1>Google font picker for React</h1>
        <p>This is a live demo showing how to use react-fontpicker.</p>
        <p>
          See <a href="https://github.com/ae9is/react-fontpicker#readme">github repo</a> or{' '}
          <a href="https://www.npmjs.com/package/react-fontpicker-ts">npm package</a> for installation instructions.
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
              <a href="#choosegooglefonts">Choose Google fonts</a>
            </li>
            <li>
              <a href="#fontcategories">Filter font categories</a>
            </li>
            <li>
              <a href="#manuallyadd">Manually add fonts</a>
            </li>
            <li>
              <a href="#forms">Forms</a>
            </li>
            <li>
              <a href="#controlled">Controlled values</a>
            </li>
            <li>
              <a href="#checkloaded">Check font loading</a>
            </li>
          </ul>
        </div>
        <h3 id="default">Default behaviour</h3>
        <p>
          By default the fontpicker is <strong>only</strong> a picker. The selected font is not loaded. (Font previews
          are pre-built into the picker.)
        </p>
        <div className={cs.example}>
          <FontPicker
            defaultValue="Audiowide"
            value={(font1: string) => setFont1(font1)}
            data-testid="default-fontpicker"
          />
        </div>
        <p data-testid="default-value">Current value: {font1}</p>
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
            fontVariants={(variants: FontToVariant) => {
              setFontVariants(variants)
            }}
            data-testid="fontvariants-fontpicker"
          />
        </div>
        <p>fontVariants:</p>
        <pre data-testid="fontvariants-fontvariants">{JSON.stringify(fontVariants ?? 'None', null, 2)}</pre>
        <pre>
          {`<FontPicker
  defaultValue="Mountains of Christmas"
  fontVariants={(variants: FontToVariant) => {
    setFontVariants(variants)
  }}
/>
<pre>{JSON.stringify(fontVariants ?? 'None', null, 2)}</pre>
`}
        </pre>

        <h3 id="nomatches">No matches</h3>
        <p>
          Customize the message when autocomplete yields no results using the <code>noMatches</code> prop.
        </p>
        <div className={cs.example}>
          <FontPicker noMatches="I've got nothing" data-testid="nomatches-fontpicker" />
        </div>
        <pre>{'<FontPicker noMatches="I\'ve got nothing" />'}</pre>

        <h3 id="autoload">Autoload fonts</h3>
        <p>
          Automatically load fonts by setting the <code>autoLoad</code> prop.
        </p>
        <div className={cs.example}>
          <FontPicker
            autoLoad
            defaultValue="Rock Salt"
            value={(font2: string) => setFont2(font2)}
            data-testid="autoload-fontpicker"
          />
        </div>
        <p data-testid="autoload-value">
          Current value: <span style={{ fontFamily: font2 }}>{font2}</span>
        </p>
        <pre>{`<FontPicker
  autoLoad
  defaultValue="Rock Salt"
  value={(font2: string) => setFont2(font2)}
/>
<p>Current value: <span style={{ fontFamily: font2 }}>{font2}</span></p>`}</pre>
        <p>This works by injecting a stylesheet link in the current document to:</p>
        <pre>
          {"https://fonts.googleapis.com/css2?family=${font.name}:ital,wght@${variants.sort().join(';')}&display=swap"}
        </pre>
        <p>For example:</p>
        <pre>{`<link rel="stylesheet"
  id="google-font-open_sans-all"
  href="https://fonts.googleapis.com/css2?family=Open Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&amp;display=swap"
>`}</pre>

        <h3 id="manualload">Manually load fonts</h3>
        <p>
          Manually load fonts by setting the <code>loadFonts</code> prop.
        </p>
        <p>Several fonts may be loaded by comma-separating the names.</p>
        <div className={cs.example}>
          <FontPicker loadFonts={manuallyLoadFonts1} data-testid="manualload-fontpicker" />
          <div className={cs.buttonGroup}>
            <button onClick={() => setManuallyLoadFonts1('Rubik Beastly')} data-testid="manualload-beastly">
              Load <span style={{ fontFamily: 'Rubik Beastly' }}>Rubik Beastly</span>
            </button>
            <button onClick={() => setManuallyLoadFonts1('Pacifico, Teko')} data-testid="manualload-pacifico-teko">
              Load <span style={{ fontFamily: 'Pacifico' }}>Pacifico</span> and{' '}
              <span style={{ fontFamily: 'Teko' }}>Teko</span>
            </button>
          </div>
        </div>
        <pre>
          {`<FontPicker loadFonts={manuallyLoadFonts1} />
<button onClick={() => setManuallyLoadFonts1('Rubik Beastly')}>
  Load <span style={{ fontFamily: 'Rubik Beastly' }}>Rubik Beastly</span>
</button>
<button onClick={() => setManuallyLoadFonts1('Pacifico, Teko')}>
  Load <span style={{ fontFamily: 'Pacifico' }}>Pacifico</span> and
  <span style={{ fontFamily: 'Teko' }}>Teko</span>
</button>`}
        </pre>
        <h3 id="loadallvariants">Load all variants</h3>
        <p>
          By default only the four most common variants (regular, bold, italic and bold italic) are loaded. You can make
          sure all variants are loaded by setting the <code>loadAllVariants</code> prop.
        </p>
        <div className={cs.example}>
          <FontPicker
            autoLoad
            loadAllVariants
            value={(font3: string) => setFont3(font3)}
            fontVariants={(variants: FontToVariant) => {
              setFontVariants3(variants)
            }}
            data-testid="loadallvariants-fontpicker"
          />
        </div>
        <p data-testid="loadallvariants-value">
          Current value: <span style={{ fontFamily: font3 }}>{font3}</span>
        </p>
        <pre>
          {`<FontPicker
  autoLoad
  loadAllVariants
  value={(font3: string) => setFont3(font3)}
  fontVariants={(variants: FontToVariant) => {
    setFontVariants3(variants)
  }}
/>
<p>Current value: <span style={{fontFamily: font3}}>{font3}</span></p>
`}
        </pre>
        <p>Font variants:</p>
        <pre data-testid="loadallvariants-fontvariants">
          {fontVariants3 &&
            fontVariants3.variants?.map((value, index) => {
              const fontFamily = fontVariants3.fontName
              const [isItalic = '0', fontWeight = '400'] = value.toString().split(',')
              const fontStyle = isItalic === '1' ? 'italic' : 'normal'
              return (
                <div key={index} style={{ fontFamily, fontWeight, fontStyle }}>
                  {fontVariants3.fontName + ' - ' + (value ?? 'None')}
                </div>
              )
            })}
        </pre>
        <pre>
          {`{fontVariants3 &&
  fontVariants3.variants?.map((value, index) => {
    const fontFamily = fontVariants3.fontName
    const [isItalic = '0', fontWeight = '400'] = value.toString().split(',')
    const fontStyle = isItalic === '1' ? 'italic' : 'normal'
    return (
      <div key={index} style={{ fontFamily, fontWeight, fontStyle }}>
        {fontVariants3.fontName + ' - ' + (value ?? 'None')}
      </div>
    )
  })}`}
        </pre>

        <h3 id="loadspecific">Load specific variants</h3>
        <p>
          The <code>loadFonts</code> prop can also accept an array of objects specifying fonts and variants. An example:
        </p>
        <pre>
          {`[
  {
    fontName: "Open Sans",
    variants: [
      { italic: false, weight: 400 },
      { italic: true, weight: 400 },
      { italic: false, weight: 700 },
      { italic: true, weight: 700 },
    ]
  },
  {
    fontName: "Rancho",
    variants: [
      { italic: false, weight: 400 },
    ]
  }
]
`}
        </pre>
        <p>
          Note that many fonts exist only in a few variants, so make sure the variants you request actually exist. For
          instance by filtering the values emitted from <code>fontVariants</code> events.
        </p>
        <p>One use case could be loading only one variant - in this example whichever is first (least bold):</p>
        <div className={cs.example}>
          <FontPicker
            defaultValue="Orbitron"
            loadFonts={thinnestFont ? [thinnestFont] : undefined}
            fontVariants={(v: FontToVariant) => {
              setFontVariants4(v)
              const thinnestFont: FontToVariant = {
                fontName: v.fontName,
                variants: v.variants.slice(0, 1),
              }
              setThinnestFont(thinnestFont)
            }}
            data-testid="loadspecific-fontpicker"
          />
        </div>
        <p data-testid="loadspecific-value">
          Current value:{' '}
          {
            // prettier-ignore
            (thinnestFont && (
              <span
                style={{
                  fontFamily: thinnestFont?.fontName,
                  fontWeight: thinnestFont?.variants?.[0].toString().split(',')[1],
                }}
              >
                {thinnestFont?.fontName}
              </span>
            )) || 'None'
          }
        </p>
        <p>Font variants (note: all rendered in lowest weight!):</p>
        <pre data-testid="loadallvariants-fontvariants">
          {fontVariants4 &&
            fontVariants4.variants?.map((value, index) => {
              const fontFamily = fontVariants4.fontName
              const [isItalic = '0', fontWeight = '400'] = value.toString().split(',')
              const fontStyle = isItalic === '1' ? 'italic' : 'normal'
              return (
                <div key={index} style={{ fontFamily, fontWeight, fontStyle }}>
                  {fontVariants4.fontName + ' - ' + (value ?? 'None')}
                </div>
              )
            })}
        </pre>
        <pre>
          {`<FontPicker
  loadFonts={thinnestFont ? [thinnestFont] : undefined}
  fontVariants={(v: FontToVariant) => {
    setFontVariants4(v)
    const thinnestFont: FontToVariant = {
      fontName: v.fontName,
      variants: v.variants.slice(0, 1),
    }
    setThinnestFont(thinnestFont)
  }}
/>

Current value:
<span
  style={{
    fontFamily: thinnestFont?.fontName,
    fontWeight: thinnestFont?.variants?.[0].toString().split(',')[1],
  }}
>
  {thinnestFont?.fontName}
</span>

Font variants:
{fontVariants4 &&
  fontVariants4.variants?.map((value, index) => {
    const fontFamily = fontVariants4.fontName
    const [isItalic = '0', fontWeight = '400'] = value.toString().split(',')
    const fontStyle = isItalic === '1' ? 'italic' : 'normal'
    return (
      <div key={index} style={{ fontFamily, fontWeight, fontStyle }}>
        {fontVariants4.fontName + ' - ' + (value ?? 'None')}
      </div>
    )
  })}
`}
        </pre>

        <h3 id="loaderonly">Font loader only</h3>
        <p>
          Set the <code>loaderOnly</code> prop to completely hide the fontpicker if you just need to load one or more
          fonts.
        </p>
        <div className={cs.example}>
          <FontPicker loadFonts={manuallyLoadFonts2} loaderOnly data-testid="loaderonly-fontpicker" />
          <div className={cs.buttonGroup}>
            <button onClick={() => setManuallyLoadFonts2('Rancho')} data-testid="loaderonly-rancho">
              Load <span style={{ fontFamily: 'Rancho' }}>Rancho</span>
            </button>
            <button onClick={() => setManuallyLoadFonts2('Smooch, Risque')} data-testid="loaderonly-smooch-risque">
              Load <span style={{ fontFamily: 'Smooch' }}>Smooch</span> and{' '}
              <span style={{ fontFamily: 'Risque' }}>Risque</span>
            </button>
          </div>
        </div>
        <pre>
          {`<FontPicker loadFonts="manuallyLoadFonts2" loaderOnly />
<button onClick={() => setManuallyLoadFonts1('Rancho')}>
  Load <span style={{ fontFamily: 'Rancho' }}>Rancho</span>
</button>
<button onClick={() => setManuallyLoadFonts1('Smooch, Risque')}>
  Load <span style={{ fontFamily: 'Smooch' }}>Smooch</span> and{' '}
  <span style={{ fontFamily: 'Risque' }}>Risque</span>
</button>
`}
        </pre>

        <h3 id="choosegooglefonts">Choose Google fonts</h3>
        <p>
          You can limit the included Google fonts using the <code>googleFonts</code> prop.
        </p>
        <p>You can supply font names as an array or as a comma separated string.</p>
        <p>
          Do note that the previews are crazy inefficient if you only use a few fonts - in that case you are probably
          better off recompiling all previews - which is beyond the scope of this document at the moment.
        </p>
        <div className={cs.example}>
          <FontPicker googleFonts={['Tinos', 'Open Sans']} data-testid="choosegooglefonts-fontpicker" />
        </div>
        <pre>{`<FontPicker googleFonts={['Tinos', 'Open Sans']} />`}</pre>

        <h3 id="fontcategories">Filter font categories</h3>
        <p>
          You can filter the fonts by category using the <code>fontCategories</code> prop.
        </p>
        <p>You can supply category names as an array or as a comma-seperated string.</p>
        <div className={cs.example}>
          <select
            value={fontCategories}
            onChange={(e) => setFontCategories(e.currentTarget.value)}
            data-testid="fontcategories-select"
          >
            <option value="all">All</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="display">Display</option>
            <option value="handwriting">Handwriting</option>
            <option value="monospace">Monospace</option>
            <option value="display, serif">display, serif</option>
            <option value={['display', 'handwriting']}>display, handwriting</option>
          </select>
          <FontPicker fontCategories={fontCategories} data-testid="fontcategories-fontpicker" />
        </div>
        <pre>
          {`<select value={fontCategories}>
  <option value="all">All</option>
  <option value="serif">Serif</option>
  <option value="sans-serif">Sans-serif</option>
  <option value="display">Display</option>
  <option value="handwriting">Handwriting</option>
  <option value="monospace">Monospace</option>
  <option value="display, serif">display, serif</option>
  <option value={['display', 'handwriting']}>display, handwriting</option>
</select>
<FontPicker fontCategories={fontCategories} />`}
        </pre>

        <h3 id="manuallyadd">Manually add fonts</h3>
        <p>
          Manually add fonts using the <code>localFonts</code> prop.
        </p>
        <p>
          You need to provide your own styling of the previews, how to create this is again beyond the scope of this
          document for now. Local fonts are also not auto-loaded, so depending on use case you may need to handle that
          too.
        </p>
        <div className={cs.example}>
          <FontPicker
            value={(font: string) => setManuallyAddFontValue(font)}
            googleFonts={['Tinos', 'Open Sans']}
            localFonts={[
              {
                name: 'BickleyScript',
                sane: 'bickleyscript',
                cased: 'bickleyscript',
                category: 'handwriting',
                variants: [
                  {
                    italic: false,
                    weight: 400,
                  },
                  '1,400',
                ],
              },
            ]}
            data-testid="manuallyadd-fontpicker"
          />
        </div>
        {typeof manuallyAddFontValue == 'string' && (
          <p data-testid="manuallyadd-value">
            Current value:{' '}
            <span
              style={{
                fontFamily: manuallyAddFontValue,
              }}
            >
              {manuallyAddFontValue}
            </span>
          </p>
        )}
        <pre>
          {`<FontPicker
  value={(font: string) => setManuallyAddFontValue(font)}
  googleFonts={['Tinos', 'Open Sans']}
  localFonts={[
    {
      name: 'BickleyScript',
      sane: 'bickleyscript',
      cased: 'bickleyscript',
      category: 'handwriting',
      variants: [
        {
          italic: false,
          weight: 400,
        },
        '1,400',
      ],
    },
  ]}
/>
<p>Current value:
  <span style={{
      fontFamily: manuallyAddFontValue,
    }}
  >
    {manuallyAddFontValue}
  </span>
</p>
`}
        </pre>
        <h3 id="forms">Forms</h3>
        <p>
          You can set the id of the font picker&rsquo;s input via the <code>inputId</code> prop,
          for pairing with a <code>{`<label>`}</code>.
        </p>
        <form name="fontForm">
          <label htmlFor="font">
            Font
          </label>
          <div className={cs.example}>
            <FontPicker
              inputId="font"
              defaultValue="Special Elite"
              data-testid="forms-fontpicker"
            />
          </div>
        </form>
        <pre>{`<form name="fontForm">
  <label htmlFor="font">
    Font
  </label>
  <FontPicker
    inputId="font"
    defaultValue="Special Elite"
  />
</form>
`}
        </pre>

        <h3 id="controlled">Controlled values</h3>
        <p>
          Default value can be dynamically controlled. The following example chains two font pickers.
        </p>
        <div className={cs.example}>
          <FontPicker
            defaultValue="Ubuntu"
            value={(font: string) => setInputFont(font)}
            data-testid="controlled-fontpicker-input"
          />
          <p data-testid="controlled-value-input">Input font value: {inputFont}</p>
          <FontPicker
            defaultValue={inputFont}
            value={(font: string) => setOutputFont(font)}
            data-testid="controlled-fontpicker-output"
          />
          <p data-testid="controlled-value-output">Output font value: {outputFont}</p>
        </div>
        <pre>{`const [inputFont, setInputFont] = useState('')
const [outputFont, setOutputFont] = useState('')
<FontPicker
  defaultValue="Ubuntu"
  value={(font: string) => setInputFont(font)}
/>
<p>Input font value: {inputFont}</p>
<FontPicker
  defaultValue={inputFont}
  value={(font: string) => setOutputFont(font)}
/>
<p>Output font value: {outputFont}</p>
`}
        </pre>

        <h3 id="checkloaded">Check font loading</h3>
        <p>
          The <code>fontsLoaded</code> callback emits whether the currently selected font and all the 
          font families specified in <code>loadFonts</code> have been loaded by the browser after loading is triggered.
        </p>
        <p>
          If font loading has not been triggered (fontpicker not set to <code>autoLoad</code>, no values in <code>loadFonts</code>),
          <code>fontsLoaded</code> will be true. 
          See: <a href="https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check#nonexistent_fonts">MDN Web Docs - Font Loading API</a>
        </p>
        <div className={cs.example}>
          <FontPicker
            defaultValue="Unlock"
            loadFonts={fontToLoad}
            value={(font: string) => setCheckLoadedFont(font)}
            fontsLoaded={(loaded: boolean) => setFontsLoaded(loaded)}
            data-testid="checkloaded-fontpicker"
          />
          <div className={cs.buttonGroup}>
            <button onClick={() => setFontToLoad(['Unkempt','Annie Use Your Telescope'])} data-testid="checkloaded-button">
              Load <span style={{ fontFamily: 'Unkempt' }}>Unkempt</span>&nbsp;
              and <span style={{ fontFamily: 'Annie Use Your Telescope' }}>Annie Use Your Telescope</span>
            </button>
          </div>
        </div>
        <p data-testid="checkloaded-value">
          Current font value: <span style={{ fontFamily: checkLoadedFont }}>{checkLoadedFont}</span>
        </p>
        <p data-testid="checkloaded-loaded">
          All fonts are loaded (current font and loadFonts): <span style={{ fontFamily: checkLoadedFont }}>{fontsLoaded ? 'true' : 'false'}</span>
        </p>
        <pre>
          {`const [checkLoadedFont, setCheckLoadedFont] = useState('')
const [fontToLoad, setFontToLoad] = useState<string | string[] | undefined>(undefined)
const [fontsLoaded, setFontsLoaded] = useState(false)
<FontPicker
  loadFonts={fontToLoad}
  value={(font: string) => setCheckLoadedFont(font)}
  fontsLoaded={(loaded: boolean) => setFontsLoaded(loaded)}
/>
<button onClick={() => setFontToLoad(['Unkempt','Annie Use Your Telescope'])}>
  Load <span style={{ fontFamily: 'Unkempt' }}>Unkempt</span> &nbsp;
  and <span style={{ fontFamily: 'Annie Use Your Telescope' }}>Annie Use Your Telescope</span>
</button>
<p>
  Current font value: <span style={{ fontFamily: checkLoadedFont }}>{checkLoadedFont}</span>
</p>
<p>
  All fonts are loaded (current font and loadFonts):
  <span style={{ fontFamily: checkLoadedFont }}>{fontsLoaded ? 'true' : 'false'}</span>
</p>
`}
        </pre>
      </div>
    </>
  )
}
