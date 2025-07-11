describe('Website Crawler', () => {
  before(() => {
    cy.visit('http://localhost:3000')
    cy.login('test@example.com', 'password123') // Create this command
  })

  it('adds and analyzes URL', () => {
    cy.get('[data-testid="add-url-input"]').type('https://example.com')
    cy.get('[data-testid="add-url-button"]').click()
    cy.contains('Pending').should('exist')
    
    cy.get('[data-testid="analyze-button"]').first().click()
    cy.contains('Processing', { timeout: 10000 }).should('exist')
    cy.contains('Completed', { timeout: 30000 }).should('exist')
  })

  it('tests bulk operations', () => {
    // Add multiple URLs
    ['https://test1.com', 'https://test2.com'].forEach(url => {
      cy.get('[data-testid="add-url-input"]').type(url)
      cy.get('[data-testid="add-url-button"]').click()
    })
    
    // Select all checkboxes
    cy.get('[data-testid="select-all-checkbox"]').click()
    
    // Bulk analyze
    cy.get('[data-testid="bulk-analyze-button"]').click()
    cy.contains('Processing', { timeout: 10000 }).should('have.length.at.least', 2)
    
    // Bulk delete
    cy.get('[data-testid="bulk-delete-button"]').click()
    cy.contains('https://test1.com').should('not.exist')
  })
})
