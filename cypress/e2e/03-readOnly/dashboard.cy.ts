import { testReadOnlyUser } from '../../../test/_globals.js'
import type { ConfigTemporaryUserCredentials } from '../../../types/configTypes.js'
import { logout, login } from '../../support/index.js'

describe('Read Only - Dashboard', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testReadOnlyUser as ConfigTemporaryUserCredentials)
    cy.visit('/dashboard')
    cy.location('pathname').should('equal', '/dashboard')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.wait(1000)
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Has no admin access', () => {
    cy.get('aside.menu a[href$="/admin"]').should('not.exist')

    cy.visit('/admin')
    cy.location('pathname').should('not.equal', '/admin')
    cy.location('pathname').should('equal', '/dashboard')
  })

  it('Has no update only access', () => {
    cy.get('aside.menu a[href$="/data"]').should('not.exist')

    cy.visit('/data')
    cy.location('pathname').should('not.equal', '/data')
    cy.location('pathname').should('equal', '/dashboard')
  })
})
