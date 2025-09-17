describe('Flow 6: Compare Performance', () => {
  it('should compare the performance of AAPL, TSLA, and MSFT', () => {
    cy.loginWithEmailAndPassword();
    cy.visit('/chat');
    cy.get('textarea').type('Compare AAPL, TSLA, and MSFT performance.');
    cy.get('.submit').click();
    cy.get('.message.bot', { timeout: 200000 }).should('be.visible');
    cy.get('.conversation').invoke('text').then((text) => {
      expect(text).to.include('AAPL');
      expect(text).to.include('TSLA');
      expect(text).to.include('MSFT');
      expect(text).to.match(/performance|comparison|vs/i);
    });
  });
});