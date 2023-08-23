import wp from '@cypress/webpack-batteries-included-preprocessor'
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:7000/',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    projectId: '6u22zp',
    setupNodeEvents(on) {
      on('file:preprocessor', wp())
    },
    env: {
      TEST_DATABASES: 'true'
    }
  }
})
