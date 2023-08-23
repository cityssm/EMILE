import { testUser } from '../../../test/_globals.js';
import { logout } from '../../support/index.js';
describe('Login Page', () => {
    beforeEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Contains a login form', () => {
        cy.get('form').should('have.length', 1);
    });
    it('Contains a _csrf field', () => {
        cy.get("form [name='_csrf']").should('exist');
    });
    it('Contains a userName field', () => {
        cy.get("form [name='userName']").should('exist');
    });
    it('Contains a password field', () => {
        cy.get("form [name='password']")
            .should('have.length', 1)
            .invoke('attr', 'type')
            .should('equal', 'password');
    });
    it('Contains a help link', () => {
        cy.get('a').contains('help', {
            matchCase: false
        });
    });
    it('Redirects to login when attempting to access dashboard', () => {
        cy.visit('/dashboard');
        cy.wait(200);
        cy.location('pathname').should('contain', '/login');
    });
    it('Redirects to login when invalid credentials are used', () => {
        if (testUser === undefined) {
            throw new Error('testUser not available');
        }
        cy.get("form [name='userName']").type(testUser.user.userName);
        cy.get("form [name='password']").type(testUser.password).type('extraJunk');
        cy.get('form').submit();
        cy.location('pathname').should('contain', '/login');
        cy.get('form').contains('Login Failed', {
            matchCase: false
        });
    });
});
