/// <reference types="cypress" />

describe('react fontpicker docs', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('emits default value', () => {
    cy.getBySel('default-value').contains('Audiowide')
  })

  it('omits fontpicker when loaderOnly', () => {
    cy.getBySel('loaderonly-fontpicker').should('not.exist')
  })

  // Note in Cypress e2e tests the injected font style links are in the document head of the test app iframe,
  //  not the full page head.
  // See src/components/App.test.tsx for extra link tests in Vitest with React Testing Library.
  it('autoloads fonts', () => {
    cy.getBySel('google-font-rock_salt-all').should('exist')
  })

  it('loads all variants', () => {
    cy.getBySel('google-font-open_sans-all').as('link')
    cy.get('@link').should('have.attr', 'rel', 'stylesheet')
    cy.get('@link').should(
      'have.attr',
      'href',
      'https://fonts.googleapis.com/css2?family=Open Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap'
    )
  })

  it('loads specific variants', () => {
    // Test id like: google-font-orbitron.*00
    // Only one variant (the thinnest) should be loaded for this example, which is currently: google-font-orbitron-400
    cy.get('[data-testid^="google-font-orbitron-"][data-testid$="00"]').as('link')
    cy.get('@link').should('have.attr', 'rel', 'stylesheet')
  })

  it('limits included fonts', () => {
    const includedFonts = ['font-preview-open_sans', 'font-preview-tinos']
    cy.getBySel('choosegooglefonts-fontpicker')
      .find('.fontpicker__option')
      .each((element) => {
        const fontPreviewClass = element.children().first().attr('class')
        expect(includedFonts).contains(fontPreviewClass)
      })
  })

  it('filters fonts by category', () => {
    // Select font categories from a plain select and check that the picker
    //  contains an expected font in that category.
    cy.getBySel('fontcategories-select').as('select')
    cy.getBySel('fontcategories-fontpicker').as('picker')
    cy.get('@select').select('serif')
    cy.get('@picker').click() // Need to open picker to render options list
    cy.get('@picker').find('.fontpicker__option .font-preview-bellefair').should('have.length', 1)
    cy.get('@select').select('sans-serif')
    cy.get('@picker').click()
    cy.get('@picker').find('.fontpicker__option .font-preview-open_sans').should('have.length', 1)
    cy.get('@select').select('monospace')
    cy.get('@picker').click()
    cy.get('@picker').find('.fontpicker__option .font-preview-ibm_plex_mono').should('have.length', 1)
    // Check that the picker does not contain an example of a non-monospace font.
    cy.get('@picker').find('.fontpicker__option .font-preview-annie_use_your_telescope').should('not.exist')
  })

  it('can search for and select manually added fonts', () => {
    // Type manual font name into search input, select it, and check that it's emitted.
    cy.getBySel('manuallyadd-value').as('value')
    cy.getBySel('manuallyadd-fontpicker').as('picker')
    cy.get('@picker').find('.fontpicker__search').type('BickleyScript{enter}')
    cy.get('@value').should('have.text', 'Current value: BickleyScript')
  })

  it('can click and emit manually added fonts', () => {
    // Open the picker, scroll to bottommost font which is the manually added font,
    //  and verify that the font is emitted correctly.
    cy.getBySel('manuallyadd-value').as('value')
    cy.getBySel('manuallyadd-fontpicker').as('picker')
    cy.get('@picker').find('.fontpicker__search').click()
    cy.get('@picker').find('.fontpicker__popout').scrollTo('bottom', { ensureScrollable: false })
    cy.get('@picker').find('.font-preview-bickleyscript').click({ force: true })
    cy.get('@value').should('have.text', 'Current value: BickleyScript')
  })

  it('falls back to sane default font with googleFonts filter applied', () => {
    cy.getBySel('filterlanguage-fontpicker').as('picker')
    cy.get('@picker').find('.fontpicker__preview .font-preview-open-sans').should('have.length', 0)
  })

  it('can select fonts in list box mode', () => {
    cy.getBySel('listbox-fontpicker').as('picker')
    cy.getBySel('listbox-value').as('value')
    cy.get('@value').contains('Tinos')
    cy.get('@picker').find('.font-preview-orbitron').click({ force: true })
    cy.get('@value').contains('Orbitron')
  })
})
