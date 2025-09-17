describe('Flow 5: Ambiguous Question', () => {
  it('should ask for clarification for an ambiguous question', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('Should I invest now?');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').contains(/investment goals|time horizon|risk tolerance/i);
  });
});