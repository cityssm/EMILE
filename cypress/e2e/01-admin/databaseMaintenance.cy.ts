import { testAdmin } from '../../../test/_globals.js'
import type { ConfigTemporaryUserCredentials } from '../../../types/configTypes.js'
import { logout, login } from '../../support/index.js'

describe('Admin - Database Maintenance', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin as ConfigTemporaryUserCredentials)
    cy.get('aside.menu a[href$="/admin"]').click()
    cy.get('main a[href$="/admin/database"]').click()
    cy.location('pathname').should('equal', '/admin/database')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})
