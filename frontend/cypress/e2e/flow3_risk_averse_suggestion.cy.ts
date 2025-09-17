describe('Flow 3: Risk-Averse Suggestion', () => {
  it('should provide investment options for a risk-averse user', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('I am risk-averse, suggest investment options.');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').should('contain.text', 'low-risk');
  });
});