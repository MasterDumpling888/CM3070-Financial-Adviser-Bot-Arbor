describe('Flow 10: Multi-Turn Conversation', () => {
  it('should handle a multi-turn conversation', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('I want to invest $20,000.');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').contains(/risk tolerance|financial goal/i);
    cy.get('.message.bot').its('length').then((initialBotMessages) => {
      cy.get('textarea').type('Moderate risk.');
      cy.get('.submit').click();

      // Wait for the number of bot messages to increase
      cy.get('.message.bot', { timeout: 200000 }).should('have.length.gt', initialBotMessages);

      // Check the content of the last bot message
      cy.get('.message.bot').last().find('.message-content', { timeout: 20000 }).should('exist').contains( /Moderate risk|moderate risk|medium risk|balanced risk|investment risk/i);
    });
  });
});
// BUG: test looks at the previous message-content element for the moderate risk