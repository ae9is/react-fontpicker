/// <reference types="cypress" />

// Custom commands used in both component and e2e testing.
// See examples here: https://on.cypress.io/custom-commands

// React testing library uses data-testid
Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args)
})

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-testid*=${selector}]`, ...args)
})
