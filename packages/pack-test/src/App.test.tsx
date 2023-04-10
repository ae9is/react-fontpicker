/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { render, within } from './test/utils'
import App from './App'

function checkFontLoaded(cssId: string) {
  const link = within(document.head).getByTestId(cssId)
  expect(link).not.to.be.null
  expect(link).toHaveAttribute('rel', 'stylesheet')
  expect(link).toHaveAttribute('id', cssId)
}

beforeEach(() => {
  render(<App />)
})

describe('<App />', () => {
  it('autoloads fonts', async () => {
    checkFontLoaded('google-font-bad_script-all')
  })
})
