describe('Flow 8: Currency Conversion', () => {
  it('should handle a request with a different currency', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('I have €5,000, suggest investment options.');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').contains(/EUR|euros|€/i);
  });
});