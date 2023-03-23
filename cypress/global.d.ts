/// <reference types="cypress" />

// Add to cypress.d.ts:
declare namespace Cypress {
  interface Chainable {
    getBySel(dataTestAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>
    getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>
  }
}
