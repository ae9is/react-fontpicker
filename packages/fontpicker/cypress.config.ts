import { defineConfig } from 'cypress'

export default defineConfig({
  retries: {
    runMode: 2,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  e2e: {
    baseUrl: 'http://localhost:4173/react-fontpicker',
    specPattern: 'cypress/e2e/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    experimentalStudio: true,
//    setupNodeEvents(on, config) {
//      // implement node event listeners here
//    },
  },
})
