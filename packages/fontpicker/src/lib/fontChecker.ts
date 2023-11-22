export type FontStyle = 'italic' | 'normal'
export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000

export interface CheckLoadedOptions {
  fontFamily: string
  fontStyle?: FontStyle
  fontWeight?: FontWeight
  timeout?: number
}

// Check whether a font family is loaded using the browser fonts api.
// Returns (true) if font family is loaded. Throws error if not loaded within timeout.
export async function checkLoaded({
  fontFamily,
  fontStyle,
  fontWeight,
  timeout = 500,
}: CheckLoadedOptions): Promise<boolean> {
  const start = new Date().getTime()
  // ref: https://stackoverflow.com/a/56239226
  let timeoutId: ReturnType<typeof setTimeout>

  return new Promise(function (resolve, reject) {
    if (document?.fonts) {
      const checker = new Promise<boolean>(function (resolve, reject) {
        const check = function () {
          const now = new Date().getTime()
          if (now - start >= timeout) {
            reject(new Error(`Font not loaded within ${timeout} ms`))
          } else {
            // ref: https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check
            const loaded = document.fonts.check(`${fontStyle ?? ''} ${fontWeight ?? ''} 0 ${fontFamily}`)
            if (loaded) {
              resolve(true)
            } else {
              setTimeout(check, 25)
            }
          }
        }
        check()
      })
      const timer = new Promise<boolean>(function (resolve, reject) {
        timeoutId = setTimeout(() => reject(new Error(`Font not loaded within ${timeout} ms`)), timeout)
      })
      Promise.race<boolean>([timer, checker]).then((value) => {
        clearTimeout(timeoutId)
        resolve(value)
      }, reject)
    } else {
      reject(new Error('Fonts API not supported by client'))
    }
  })
}
