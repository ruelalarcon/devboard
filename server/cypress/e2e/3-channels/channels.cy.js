describe("Channel Tests", () => {
  // Generate a random string for unique channel names
  const randomString = Math.random().toString(36).substring(2, 8);
  const testUser = {
    username: Cypress.env("adminUsername") || "admin",
    password: Cypress.env("adminPassword") || "test_admin_password",
  };
  const channelName = `Test Channel ${randomString}`;

  beforeEach(() => {
    // Login before each test
    cy.login(testUser.username, testUser.password);

    // Verify we're on the home page
    cy.url().should("include", "/home");
  });

  it("should create a new channel", () => {
    // Click on Create Channel button
    cy.get('[data-cy="create-channel-button"]').click();

    // Modal should appear
    cy.get('[data-cy="create-channel-modal"]').should("be.visible");

    // Fill in the form - using data-cy selectors
    cy.get('[data-cy="channel-name-input"]').type(channelName);
    cy.get('[data-cy="channel-description-input"]').type("This is a test channel description");

    // Submit the form
    cy.get('[data-cy="create-channel-submit"]').click();

    // Should see success notification
    cy.get('[data-cy="notification-success"]').should("be.visible");

    // Channel should appear in the list
    cy.get(`[data-cy="channel-item"]`).contains(channelName).should("be.visible");
  });

  it("should navigate to channel details", () => {
    // Find and click on the created channel
    cy.get(`[data-cy="channel-item"]`).contains(channelName).click();

    // Verify we're on the channel detail page
    cy.url().should("include", "/channel/");

    // Check channel title is displayed
    cy.get('[data-cy="channel-title"]').contains(channelName).should("be.visible");
    cy.get('[data-cy="channel-description"]')
      .contains("This is a test channel description")
      .should("be.visible");

    // Verify channel elements
    cy.contains("Messages").should("be.visible");
    cy.get('[placeholder="Type your message here..."]').should("be.visible");
  });

  it("should post a message in a channel", () => {
    // Navigate to the channel
    cy.get(`[data-cy="channel-item"]`).contains(channelName).click();

    // Type a message
    cy.get('[data-cy="message-input"]').type("This is a test message from Cypress");

    // Submit the message
    cy.get('[data-cy="message-submit"]').click();

    // Wait for message to appear
    cy.wait(100);

    // Message should appear
    cy.get('[data-cy="message-item"]')
      .contains("This is a test message from Cypress")
      .should("be.visible");

    // Should see View Replies button on the message - search within the message item that contains our test text
    cy.get('[data-cy="message-item"]')
      .contains("This is a test message from Cypress")
      .parents('[data-cy="message-item"]')
      .get('[data-cy="view-replies-button"]')
      .should("be.visible");
  });

  it("should upvote and downvote a message", () => {
    // Navigate to the channel
    cy.get(`[data-cy="channel-item"]`).contains(channelName).click();

    // Wait for messages to load
    cy.wait(100);

    // Find the message we created
    const messageContainer = cy
      .get('[data-cy="message-item"]')
      .contains("This is a test message from Cypress")
      .parents('[data-cy="message-item"]');

    // Initial check - Get the positive count
    messageContainer.get('[data-cy="positive-count"]').then(($element) => {
      const initialCount = parseInt($element.text());

      // Upvote the message
      messageContainer.get('[data-cy="upvote-button"]').click();

      // Check if positive count increased by 1
      messageContainer.get('[data-cy="positive-count"]').should(($newElement) => {
        expect(parseInt($newElement.text())).to.equal(initialCount + 1);
      });
    });

    // Now check downvoting - first get the current counts
    messageContainer.get('[data-cy="positive-count"]').then(($posElement) => {
      const posCount = parseInt($posElement.text());

      messageContainer.get('[data-cy="negative-count"]').then(($negElement) => {
        const negCount = parseInt($negElement.text());

        // Click downvote (which should remove upvote and add downvote)
        messageContainer.get('[data-cy="downvote-button"]').click();

        // Positive count should decrease by 1
        messageContainer.get('[data-cy="positive-count"]').should(($newElement) => {
          expect(parseInt($newElement.text())).to.equal(posCount - 1);
        });

        // Negative count should increase by 1
        messageContainer.get('[data-cy="negative-count"]').should(($newElement) => {
          expect(parseInt($newElement.text())).to.equal(negCount + 1);
        });
      });
    });
  });

  it("should navigate to message details and reply to a message, as well as create a nested reply", () => {
    // Navigate to the channel
    cy.get(`[data-cy="channel-item"]`).contains(channelName).click();

    // Wait for messages to load
    cy.wait(100);

    // Find the message we created and click its View Replies button
    cy.get('[data-cy="message-item"]')
      .contains("This is a test message from Cypress")
      .parents('[data-cy="message-item"]')
      .get('[data-cy="view-replies-button"]')
      .click();

    // Verify we're on the message detail page
    cy.url().should("include", "/message/");

    // Type a reply
    cy.get('[data-cy="message-input"]').type("This is a reply to the message");

    // Submit the reply
    cy.get('[data-cy="message-submit"]').click();

    // Wait for reply to appear
    cy.wait(100);

    // Reply should appear
    cy.contains("This is a reply to the message").should("be.visible");

    // Wait for elements to be ready
    cy.wait(100);

    // Find the first reply and click Reply button
    cy.contains("This is a reply to the message")
      .parents('[data-cy="message-item"]')
      .find("button")
      .contains("Reply")
      .click();

    // Type a nested reply
    cy.get('[data-cy="message-input"]').last().type("This is a nested reply");

    // Submit the nested reply
    cy.get('[data-cy="message-submit"]').last().click();

    // Wait for nested reply to appear
    cy.wait(1200);

    // Nested reply should appear
    cy.contains("This is a nested reply").should("be.visible");
  });
});
