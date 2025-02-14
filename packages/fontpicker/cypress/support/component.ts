// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// ref: https://docs.cypress.io/api/cypress-api/custom-commands#6-Create-a-function-that-adds-the-custom-command
import { registerCommands } from './commands'
registerCommands()

import { mount } from '@cypress/react'

// Add typing to cypress.d.ts:
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
