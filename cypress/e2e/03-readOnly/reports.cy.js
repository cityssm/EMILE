import { testReadOnlyUser } from '../../../test/_globals.js';
import { logout, login } from '../../support/index.js';
describe('Read Only - Reports', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testReadOnlyUser);
        cy.get('aside.menu a[href$="/reports"]').click();
        cy.location('pathname').should('equal', '/reports');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
