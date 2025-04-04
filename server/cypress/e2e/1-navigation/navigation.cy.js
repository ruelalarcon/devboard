describe("Navigation Tests", () => {
  beforeEach(() => {
    // Visit the landing page before each test
    cy.visit("/");
  });

  it("should display the landing page correctly", () => {
    // Check if the title is visible
    cy.get('[data-cy="title"]').should("be.visible");
    cy.contains("DevBoard").should("be.visible");

    // Check if login and register buttons are visible - updated selectors
    cy.get('[data-cy="login-button"]').should("be.visible");
    cy.get('[data-cy="register-button"]').should("be.visible");
  });

  it("should navigate to login page", () => {
    // Click on login button - updated selector
    cy.get('[data-cy="login-button"]').click();

    // Verify that we are on the login page
    cy.url().should("include", "/login");
    cy.get('[data-cy="login-title"]').should("be.visible");
    cy.contains("Login to DevBoard").should("be.visible");
  });

  it("should navigate to register page", () => {
    // Click on register button - updated selector
    cy.get('[data-cy="register-button"]').click();

    // Verify that we are on the register page
    cy.url().should("include", "/register");
    cy.get('[data-cy="register-title"]').should("be.visible");
    cy.contains("Register for DevBoard").should("be.visible");
  });
});
