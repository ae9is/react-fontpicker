// https://github.com/vitest-dev/vitest/tree/main/examples/react-testing-lib
// Setup for using React Testing Library with Vitest, a Jest replacement for Vite.

import { StrictMode } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
    ...options,
  })

export { act } from 'react'
export { screen, within, waitFor, fireEvent } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
// override render export
export { customRender as render }
