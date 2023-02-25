# react-fontpicker

A Google font picker component for React.

- No dependencies (other than React)
- 1330 Google fonts
- Font previews from pre-generated images
- Optionally autoloads fonts

Forked from https://github.com/Mikk3lRo/vue-fontpicker/

# Documentation

Documentation and live demo is available at:
https://ae9is.github.io/react-fontpicker/

# Installing

```bash
# npm
npm i react-fontpicker-ts
# yarn
yarn add react-fontpicker-ts
```

Then, import the component and stylesheet:

```js
import FontPicker from 'react-fontpicker-ts'
import 'react-fontpicker-ts/dist/index.css'
```

# Styling

See css classnames in: [src/components/FontPicker.css](https://github.com/ae9is/react-fontpicker/tree/main/src/components/FontPicker.css)

# Project structure

The live demo is a Vite app you can run yourself via `npm run dev` and which builds to /docs. Uses tsconfig.json.

The font picker component itself builds via tsup (i.e. esbuild) to /dist with type definitions generated according to tsconfig.types.json.

The font preview generation php script is currently as-is from the fork, but if re-run should build to /font-preview.
