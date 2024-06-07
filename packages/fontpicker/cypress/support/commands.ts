/// <reference types="cypress" />

// Custom commands used in both component and e2e testing.
// See examples here: https://on.cypress.io/custom-commands

// ref: https://docs.cypress.io/api/cypress-api/custom-commands#6-Create-a-function-that-adds-the-custom-command
export function registerCommands() {
  // React testing library uses data-testid
  Cypress.Commands.add('getBySel', (selector, ...args) => {
    return cy.get(`[data-testid=${selector}]`, ...args)
  })

  Cypress.Commands.add('getBySelLike', (selector, ...args) => {
    return cy.get(`[data-testid*=${selector}]`, ...args)
  })
}
