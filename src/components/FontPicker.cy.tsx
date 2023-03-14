/// <reference types="cypress" />
import FontPicker from './FontPicker'

describe('<FontPicker />', () => {
  it('renders', () => {
    cy.mount(<FontPicker />)
  })

  it('can change default font', () => {
    const defaultValue = 'Audiowide'
    const value = cy.spy().as('value')
    cy.mount(<FontPicker defaultValue={defaultValue} value={value} />)
    cy.get('@value').should('have.been.called', 1)
    cy.get('@value').should('have.been.calledWith', defaultValue)
  })

  it('gives font variants', () => {
    const defaultValue = 'Mountains of Christmas'
    const fontVariants = cy.spy().as('fontVariants')
    const expectedResult = {
      fontName: 'Mountains of Christmas',
      variants: ['0,400', '0,700'],
    }
    cy.mount(<FontPicker defaultValue={defaultValue} fontVariants={fontVariants} />)
    cy.get('@fontVariants').should('have.been.called', 1)
    cy.get('@fontVariants').should('have.been.calledWithMatch', expectedResult)
  })

  it('returns custom no matches', () => {
    const noMatches = "I've got nothing"
    cy.mount(<FontPicker noMatches={noMatches} />)
    cy.get('input').type('Not a font name')
    cy.contains(noMatches)
  })

  it('gets all variants', () => {
    // Doesn't test the css style loading, just that all variants are emitted by the fontpicker.
    // See e2e test for loading.
    const defaultValue = 'Open Sans'
    const fontVariants = cy.spy().as('fontVariants')
    const expectedResult = {
      fontName: 'Open Sans',
      variants: [
        '0,300',
        '0,400',
        '0,500',
        '0,600',
        '0,700',
        '0,800',
        '1,300',
        '1,400',
        '1,500',
        '1,600',
        '1,700',
        '1,800',
      ],
    }
    cy.mount(<FontPicker loadAllVariants defaultValue={defaultValue} fontVariants={fontVariants} />)
    cy.get('@fontVariants').should('have.been.called', 1)
    cy.get('@fontVariants').should('have.been.calledWithMatch', expectedResult)
  })
})
