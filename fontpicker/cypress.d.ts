/// <reference types="cypress" />

import { mount } from 'cypress/react18'

// Type definitions needed for IDE for component tests in src/**/*.cy.tsx
// Should mirror definitions in cypress/global.d.ts and cypress/support/component.ts
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      getBySel(dataTestAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>
      getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>
    }
  }
}
