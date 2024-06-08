# react-fontpicker

A Google font picker component for React.

- No dependencies (other than React)
- 1600+ Google fonts
- Font previews from pre-generated SVG images
- Optionally autoloads fonts

Forked from https://github.com/Mikk3lRo/vue-fontpicker/

## Documentation

A live demo including usage is available at:
https://ae9is.github.io/react-fontpicker/

## Installing

```bash
# npm
npm i react-fontpicker-ts
# yarn
yarn add react-fontpicker-ts

# much smaller package with fewer fonts
npm i react-fontpicker-ts-lite
```

Then, import the component and stylesheet:

```js
import FontPicker from 'react-fontpicker-ts'
import 'react-fontpicker-ts/dist/index.css'
```

## Styling

See css classnames in: [packages/fontpicker/src/components/FontPicker.css](https://github.com/ae9is/react-fontpicker/tree/main/packages/fontpicker/src/components/FontPicker.css)

For an example integrating the font picker into an app, see here: [ae9is/uimix](https://github.com/ae9is/uimix/commit/52fd0292a094bbcdfa766ce36ace055a7de93838)

## Project structure

The font picker project lives in this [Turborepo](https://turbo.build/repo/docs) monorepo at [packages/fontpicker/](https://github.com/ae9is/react-fontpicker/tree/main/packages/fontpicker/)

The [live demo](https://ae9is.github.io/react-fontpicker/) is a Vite app you can run yourself via `npm run dev` and which builds to `/docs`. Uses `tsconfig.json`.

The font picker component itself builds via `tsup` (i.e. `esbuild`) to `/dist` with type definitions generated via `tsc` according to `tsconfig.types.json`.

The font preview generation PHP script downloads font files to `/font-cache` and builds font image previews to `/font-preview`.

## Performance

The font picker previews work by loading font preview image files in CSS. The fonts are split across many image files for faster initial preview.

Once the dropdown select is opened, all the preview image files are retrieved enabling smooth scrolling and searching.

No requests are made to the Google fonts API unless the font picker is set to autoload, in which case the currently selected font is appended to the page header. (The previously selected font link is _not_ removed.)

For example:

```html
<head>
  ...
  <link
    rel="stylesheet"
    id="google-font-rock_salt-all"
    href="https://fonts.googleapis.com/css2?family=Rock Salt:ital,wght@0,400&amp;display=swap"
  />
</head>
```

The big trade-off of this approach is that the component's bundle is quite large due to all the font image previews: 8 MB in compressed SVG images for 1633 fonts. Make sure you serve compressed SVGs! [See here for an example for Vite.](packages/fontpicker/vite.config.mts)

If you're looking for a lighter weight option, you can use `react-fontpicker-ts-lite` instead which is around 180 KB.

Or, for a different font picker following an on demand approach, check out: [https://github.com/samuelmeuli/font-picker-react](https://github.com/samuelmeuli/font-picker-react)

`font-picker-react` requires a Google API key, and works best at the default font limit of 50 (fonts to choose from).

## Building font previews

_Note: most users shouldn't need to rebuild the font previews, but this section is included for convenience if you need to grab the latest fonts or edit the previews._

### 1\. Google API key

Get a Google API key here [https://developers.google.com/fonts/docs/developer_api#APIKey](https://developers.google.com/fonts/docs/developer_api#APIKey) and create a new file called `GOOGLE_API_KEY` in `react-fontpicker/packages/fontpicker/scripts`, in the same directory as the `scripts/buildFontPreviews.ts` script.

### 2\. Font preview script

#### All Google fonts

To generate font previews for all currently available Google fonts (latin font families only, minus `Kumar One`).

```bash
cd react-fontpicker/packages/fontpicker
npm run build-font-previews
```

_Note: For 1600 fonts, budget 20-30 minutes and 800 MB to download all the fonts. Compiling the image previews themselves should be less than a minute. When re-running, the script only retrieves new font info if it's older than 1 week and skips downloading cached fonts._

#### Custom fonts

To generate font previews for custom fonts you'll need some info about the fonts and paths to the font file downloaded in TTF format.

```bash
buildFontPreviews.ts output-dir "font-name|font-category|font-variants-info|font-file" "font-name-2..."
```

Where font-variants-info is an array of values like 0,400 and 1,700 joined by +.
The first value denotes a normal (0) or italic (1) font.
The second value is the font weight (i.e. 100 = thin, 400 = normal, 700 = bold, 900 = heavy).

For example:

```bash
buildFontPreviews.ts output-dir "FontName|sans-serif|0,400+0,700+1,400+1,700|/path/to/font.ttf" "Font2|serif|0,400|/path/to/font2.ttf"
```

See the `build-font-previews-manual` run script in: [packages/fontpicker/package.json](packages/fontpicker/package.json)

## Development

### Installation

This monorepo uses [Turborepo](https://turbo.build/repo/docs). Set it up using `npm install`.

You can then use Turbo to run commands from the root (or sub project) directory, for ex: `turbo build` or `turbo dev`.

### Testing

This app uses Vitest and [Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress) for testing. Make sure to setup the prerequisites for Cypress on your system.

On Ubuntu:

```bash
apt install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```
