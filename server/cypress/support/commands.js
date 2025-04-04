// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Login command to reuse in tests
Cypress.Commands.add("login", (username, password) => {
  cy.visit("/login");
  cy.get('[data-cy="username-input"]').type(username);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-submit-button"]').click();
});

// Register command
Cypress.Commands.add("register", (username, password, displayName) => {
  cy.visit("/register");
  cy.get('[data-cy="username-input"]').type(username);
  cy.get('[data-cy="display-name-input"]').type(displayName);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="confirm-password-input"]').type(password);
  cy.get('[data-cy="register-submit-button"]').click();
});
