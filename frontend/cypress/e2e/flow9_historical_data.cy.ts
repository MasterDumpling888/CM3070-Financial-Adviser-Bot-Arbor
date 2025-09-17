describe('Flow 9: Historical Data', () => {
  it('should retrieve historical data for a stock', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('Show me AAPL price trends for the last 30 days.');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.message.bot .message-content').invoke('text').then((text) => {
      expect(text).to.include('AAPL');
      expect(text).to.match(/30 days|one month|4 weeks/i);
    });
  });
});
// BUG: finrl response have a ghost message component at the top before rendering the card. test checks the ghost immediately before waiting for actual response