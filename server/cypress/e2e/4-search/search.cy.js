describe("Search Tests", () => {
  const testUser = {
    username: Cypress.env("adminUsername") || "admin",
    password: Cypress.env("adminPassword") || "test_admin_password",
  };

  beforeEach(() => {
    // Navigate to search page before each test
    cy.login(testUser.username, testUser.password);
    cy.visit("/search");
    cy.url().should("include", "/search");
    cy.get("[data-cy='search-title']").should("be.visible");
  });

  it("should have all search components displayed", () => {
    // Check for search input
    cy.get("[data-cy='search-term-input']").should("be.visible");

    // Check for search button
    cy.get("[data-cy='search-button']").should("be.visible");

    // Check for search type options
    cy.get("[data-cy='search-type-label']").should("be.visible");
    cy.get("[data-cy='channels-option']").should("be.visible");
    cy.get("[data-cy='messages-option']").should("be.visible");
    cy.get("[data-cy='users-option']").should("be.visible");

    // Check for sort options
    cy.get("[data-cy='sort-by-select']").should("be.visible");
  });

  it("should search for channels", () => {
    // Input search term
    cy.get("[data-cy='search-term-input']").type("Channel");

    // Select channels tab (should be selected by default)
    cy.get("[data-cy='channels-option']").click();

    // Click search button
    cy.get("[data-cy='search-button']").click();

    // Wait for the search to complete
    cy.wait(1000);

    // Should see results section if results are found
    cy.get("body").then(($body) => {
      if ($body.text().includes("Results")) {
        cy.get("[data-cy='search-results-title']").should("be.visible");
      } else {
        // If no results, should see a message
        cy.get("[data-cy='no-results-message']").should("be.visible");
      }
    });
  });

  it("should search for users", () => {
    // Input search term
    cy.get("[data-cy='search-term-input']").type("admin");

    // Select users tab
    cy.get("[data-cy='users-option']").click();

    // Click search button
    cy.get("[data-cy='search-button']").click();

    // Wait for the search to complete
    cy.wait(1000);

    // Should see results section or no results message
    cy.get("body").then(($body) => {
      if ($body.text().includes("Results")) {
        cy.get("[data-cy='search-results-title']").should("be.visible");

        // Check for administrator in results
        cy.get("[data-cy='user-card-username']").contains("@admin").should("exist");
      } else {
        // If no results, should see a message
        cy.get("[data-cy='no-results-message']").should("be.visible");
      }
    });
  });
});
