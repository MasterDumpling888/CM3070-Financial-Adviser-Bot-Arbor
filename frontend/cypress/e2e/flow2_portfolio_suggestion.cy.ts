
describe('Flow 2: Portfolio Suggestion', () => {
  it('should provide a portfolio suggestion for $10,000', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('I have $10,000. Suggest a diversified portfolio.');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').should('contain.text', 'portfolio');
    cy.get('.message.bot .message-content').should('contain.text', 'diversified');
  });
});