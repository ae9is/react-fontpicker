/// <reference types="vitest" />
import { describe, it, expect, beforeEach } from 'vitest'
import { act, screen, render, within, userEvent, waitFor, fireEvent } from '../test/utils'
import App from './App'

function checkFontLoaded(cssId: string) {
  const link = within(document.head).getByTestId(cssId)
  expect(link).not.to.be.null
  expect(link).toHaveAttribute('rel', 'stylesheet')
  expect(link).toHaveAttribute('id', cssId)
}

beforeEach(async () => {
  await act(() => {
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

  it('can test whether fonts have been loaded by the client', async () => {
    // fontsLoaded should emit a brief change in state while fonts are loading
    const picker = await screen.findByTestId('checkloaded-fontpicker')
    await waitFor(() => screen.queryByTestId('checkloaded-loaded')?.textContent?.includes('true'))
    await act(async () => {
      await userEvent.click(screen.getByTestId('checkloaded-button'))
    })
    await waitFor(() => screen.queryByTestId('checkloaded-loaded')?.textContent?.includes('false'))
    await act(async () => {
      const search = await picker.querySelector('.fontpicker__search')
      expect(search).toBeTruthy()
      if (search) {
        fireEvent.change(search, { target: { value: 'Unkempt' } })
        fireEvent.keyDown(search, { key: 'Enter', code: 'Enter', keyCode: 13 })
      }
    })
    await waitFor(() => screen.queryByTestId('checkloaded-loaded')?.textContent?.includes('true'))
  })

  it('can apply a googleFonts filter function', async () => {
    const picker = await screen.findByTestId('filterlanguage-fontpicker')
    await act(async () => {
      // Need to open picker to render options list
      const pickerInput = await picker.querySelector('.fontpicker__search')
      expect(pickerInput).toBeTruthy()
      if (pickerInput) {
        await userEvent.click(pickerInput)
      }
    })
    const missingFont = await picker.querySelector('.fontpicker__option .font-preview-open-sans')
    expect(missingFont).toBeFalsy()
    const presentFont = await picker.querySelector('.fontpicker__option .font-preview-zcool_kuaile')
    expect(presentFont).toBeTruthy()
  })
})
