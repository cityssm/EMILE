import { testAdmin } from '../../../test/_globals.js';
import { logout, login } from '../../support/index.js';
describe('Admin - User Maintenance', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.get('aside.menu a[href$="/admin"]').click();
        cy.get('main a[href$="/admin/users"]').click();
        cy.location('pathname').should('equal', '/admin/users');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
