/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { act, screen, render, within, userEvent } from '../test/utils'
import App from './App'

function checkFontLoaded(cssId: string) {
  const link = within(document.head).getByTestId(cssId)
  expect(link).not.to.be.null
  expect(link).toHaveAttribute('rel', 'stylesheet')
  expect(link).toHaveAttribute('id', cssId)
}

beforeEach(() => {
  act(() => {
    render(<App />)
  })
})

describe('<App />', () => {
  it('autoloads fonts', async () => {
    checkFontLoaded('google-font-rock_salt-all')
  })

  it('manually loads fonts', async () => {
    await screen.findByTestId('manualload-fontpicker')
    await act(async () => {
      await userEvent.click(screen.getByTestId('manualload-beastly'))
    })
    checkFontLoaded('google-font-rubik_beastly-all')
  })

  it('loads fonts while hidden', async () => {
    expect(screen.queryByTestId('loaderonly-fontpicker')).to.be.null
    await act(async () => {
      await userEvent.click(screen.getByTestId('loaderonly-rancho'))
    })
    checkFontLoaded('google-font-rancho-all')
  })

  it('can dynamically control defaultValue', async () => {
    await screen.findByTestId('controlled-fontpicker-input')
    await screen.findByTestId('controlled-fontpicker-output')
    expect(screen.queryByTestId('controlled-value-input')).toHaveTextContent('Ubuntu')
    expect(screen.queryByTestId('controlled-value-output')).toHaveTextContent('Ubuntu')
  })
})
