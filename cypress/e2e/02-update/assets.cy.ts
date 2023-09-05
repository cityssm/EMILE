import { testUpdateUser } from '../../../test/_globals.js'
import type { ConfigTemporaryUserCredentials } from '../../../types/configTypes.js'
import { logout, login } from '../../support/index.js'

describe('Update User - Assets', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdateUser as ConfigTemporaryUserCredentials)
    cy.get('aside.menu a[href$="/assets"]').click({ force: true })
    cy.location('pathname').should('equal', '/assets')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Has create buttons', () => {
    cy.get('[data-cy="add"]').should('exist')
  })
})
