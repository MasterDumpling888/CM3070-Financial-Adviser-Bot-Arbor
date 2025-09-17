
describe('Flow 1: Get Current Stock Price', () => {
  it('should get the current price of AAPL', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('What is the current price of AAPL?');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').should('contain.text', 'AAPL');
  });
});