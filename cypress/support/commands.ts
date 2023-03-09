/// <reference types="cypress" />

// Custom commands used in both component and e2e testing.
// See examples here: https://on.cypress.io/custom-commands

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-test=${selector}]`, ...args)
})

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args)
})