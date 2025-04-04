// Script for starting the server during Cypress tests
require("dotenv").config();
const resetTestDatabase = require("./reset-test-db");
const { startServer } = require("./server");

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = 3001;
process.env.ADMIN_PASSWORD = "test_admin_password";

// Set up test database configuration
process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || "programming_channel_test";
process.env.DB_USER = process.env.DB_USER || "root";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "";
process.env.DB_HOST = process.env.DB_HOST || "localhost";

console.log(`Using test database: ${process.env.TEST_DB_NAME}`);

// Store server instance
let serverInstance = null;

// Reset test database and start server
async function initTestServer() {
  try {
    // Reset the test database first
    await resetTestDatabase();

    // Reset any modules that might have cached database connections
    Object.keys(require.cache).forEach((key) => {
      if (key.includes("models") || key.includes("database")) {
        delete require.cache[key];
      }
    });

    // Start the server after the database is reset
    serverInstance = await startServer();
    console.log("Test server started successfully on port 3001");
  } catch (error) {
    console.error("Error initializing test server:", error);
    process.exit(1);
  }
}

// Start the test environment
initTestServer();

// Ensure the process doesn't exit immediately
process.stdin.resume();

// Handle process termination
process.on("SIGINT", () => {
  console.log("Test server shutting down...");
  if (serverInstance) {
    serverInstance.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle kill signals
process.on("SIGTERM", () => {
  console.log("Test server received SIGTERM");
  if (serverInstance) {
    serverInstance.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
