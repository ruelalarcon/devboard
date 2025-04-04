// Script to reset the test database before running Cypress tests
require("dotenv").config();

// Set test environment
process.env.NODE_ENV = "test";

// Set test database configuration
process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || "programming_channel_test";
process.env.DB_USER = process.env.DB_USER || "root";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "";
process.env.DB_HOST = process.env.DB_HOST || "localhost";

const { Sequelize } = require("sequelize");
const config = require("./config/database")[process.env.NODE_ENV];

async function resetTestDatabase() {
  console.log(`Resetting test database: ${config.database}`);

  try {
    // Create a temporary connection to the MySQL server without specifying a database
    const tempSequelize = new Sequelize({
      dialect: config.dialect,
      host: config.host,
      username: config.username,
      password: config.password,
      logging: false,
    });

    // Drop the test database if it exists
    await tempSequelize.query(`DROP DATABASE IF EXISTS ${config.database};`);
    console.log(`Dropped database: ${config.database}`);

    // Create a new test database
    await tempSequelize.query(`CREATE DATABASE ${config.database};`);
    console.log(`Created database: ${config.database}`);

    // Close the temporary connection
    await tempSequelize.close();

    // Now connect to the new database and create tables
    // We're using require to get a fresh instance each time
    const db = require("./models");
    await db.sequelize.sync({ force: true });
    console.log("Database tables created");

    // Create admin account
    await db.User.create({
      username: "admin",
      password: process.env.ADMIN_PASSWORD || "test_admin_password",
      displayName: "Administrator",
      isAdmin: true,
    });
    console.log("Admin account created");

    // IMPORTANT: We don't close the connection here when running in the test-setup context
    // because the server will need this connection
    if (require.main === module) {
      // Only close if this script is being run directly
      await db.sequelize.close();
      console.log("Database connection closed");
    }

    console.log("Test database reset completed successfully");
    return true;
  } catch (error) {
    console.error("Error resetting test database:", error);
    process.exit(1);
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  resetTestDatabase().then(() => process.exit(0));
}

module.exports = resetTestDatabase;
