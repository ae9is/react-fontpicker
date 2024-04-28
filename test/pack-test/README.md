# pack-test

For testing `npm pack`s of the fontpicker and fontpicker-lite built packages, before publication to npm.

Only the lite package is included in the main.yml CI via fontpicker-lite/test-lite.sh, which calls pack-test's "npm run test". (The full fontpicker cache is ~800 MB and takes ~20 min of API requests to download.)

To do a visual inspection of the fontpicker and fontpicker-lite packages, first make sure the local packages are installed via `prep-pack-test.sh`. Then run: `npm run dev`.