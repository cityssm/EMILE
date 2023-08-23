import 'cypress-axe'

import type { ConfigTemporaryUserCredentials } from '../../types/configTypes.js'

export const logout = (): void => {
  cy.visit('/logout')
}

export const login = (user: ConfigTemporaryUserCredentials): void => {
  cy.visit('/login')

  cy.get('[data-cy="allowTesting"]').should('exist')

  cy.get("form [name='userName']").type(user.user.userName)
  cy.get("form [name='password']").type(user.password)

  cy.get('form').submit()

  cy.location('pathname').should('not.contain', '/login')

  // Logged in pages have a navbar
  cy.get('aside.menu').should('have.length', 1)
}

export const ajaxDelayMillis = 800
