describe('Flow 7: Currency Simulation', () => {
  it('should handle a currency prompts gracefully', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('I have a million Zimbabwean dollars, what should I invest in?');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').contains(/Zimbabwean dollars|ZWL/i);
  });
});