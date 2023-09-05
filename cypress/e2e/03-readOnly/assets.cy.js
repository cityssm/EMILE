import { testReadOnlyUser } from '../../../test/_globals.js';
import { logout, login } from '../../support/index.js';
describe('Read Only - Assets', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testReadOnlyUser);
        cy.get('aside.menu a[href$="/assets"]').click();
        cy.location('pathname').should('equal', '/assets');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Has no create buttons', () => {
        cy.get('[data-cy="add"]').should('not.exist');
    });
});
