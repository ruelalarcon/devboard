describe("Authentication Tests", () => {
  // Generate a random username to avoid conflicts
  const randomString = Math.random().toString(36).substring(2, 8);
  const testUser = {
    username: `testuser_${randomString}`,
    password: "password123",
    displayName: "Test User",
  };
  const adminUser = {
    username: Cypress.env("adminUsername") || "admin",
    password: Cypress.env("adminPassword") || "test_admin_password",
  };

  it("should register a new user", () => {
    // Use custom command to register
    cy.register(testUser.username, testUser.password, testUser.displayName);

    // Should redirect to home page after successful registration
    cy.url().should("include", "/home");

    // Should see success notification
    cy.get('[data-cy="notification-success"]').should("be.visible");
    cy.contains("Your account has been created successfully").should("be.visible");

    // Verify we're logged in by checking for Home page elements
    cy.get('[data-cy="home-title"]').should("be.visible");
    cy.get('[data-cy="create-channel-button"]').should("be.visible");
  });

  // Separate the logout test from register test
  it("should login and then log out successfully", () => {
    // Login first
    cy.login(testUser.username, testUser.password);

    // Verify we're on the home page
    cy.url().should("include", "/home");

    // Make sure we're actually logged in
    cy.get('[data-cy="create-channel-button"]').should("be.visible");

    // Click on the user menu
    cy.get('[data-cy="user-menu"]').click();

    // Click logout button
    cy.get('[data-cy="logout-button"]').click();

    // After logout, verify we're redirected to the landing page
    cy.url().should("include", "/");
    cy.get('[data-cy="login-button"]').should("exist");
  });

  it("should login with valid credentials", () => {
    // Use custom command to login
    cy.login(testUser.username, testUser.password);

    // Should redirect to home page after successful login
    cy.url().should("include", "/home");

    // Should see success notification
    cy.get('[data-cy="notification-success"]').should("be.visible");
    cy.contains("You have been logged in successfully").should("be.visible");

    // Verify we're logged in
    cy.get('[data-cy="home-title"]').should("be.visible");
  });

  it("should login as admin", () => {
    // Use custom command to login as admin
    cy.login(adminUser.username, adminUser.password);

    // Should redirect to home page after successful login
    cy.url().should("include", "/home");

    // Verify we're logged in as admin
    cy.get('[data-cy="home-title"]').should("be.visible");
  });

  it("should not login with invalid credentials", () => {
    // Visit login page
    cy.visit("/login");

    // Enter invalid credentials
    cy.get('[data-cy="username-input"]').type(testUser.username);
    cy.get('[data-cy="password-input"]').type("wrongpassword");
    cy.get('[data-cy="login-submit-button"]').click();

    // Should stay on login page
    cy.url().should("include", "/login");

    // Should see error notification
    cy.get('[data-cy="notification-error"]').should("be.visible");
  });
});
