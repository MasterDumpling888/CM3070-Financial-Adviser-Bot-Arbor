describe('Flow 4: Invalid Ticker', () => {
  it('should handle an invalid ticker gracefully', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('Get stock price for XXXX.');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').contains(/ticker symbol|stock ticker/i);
  });
});