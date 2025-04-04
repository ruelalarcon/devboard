// Script to create the test database if it doesn't exist
require("dotenv").config();
const { Sequelize } = require("sequelize");

// Set test database name
const testDbName = process.env.TEST_DB_NAME || "programming_channel_test";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbHost = process.env.DB_HOST || "localhost";

async function createTestDatabase() {
  console.log(`Checking for test database: ${testDbName}`);

  // Create a connection without specifying a database
  const sequelize = new Sequelize({
    dialect: "mysql",
    host: dbHost,
    username: dbUser,
    password: dbPassword,
    logging: false,
  });

  try {
    // Check if the database exists
    const [results] = await sequelize.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${testDbName}'`
    );

    if (results.length === 0) {
      // Database doesn't exist, create it
      await sequelize.query(`CREATE DATABASE ${testDbName}`);
      console.log(`Created test database: ${testDbName}`);
    } else {
      console.log(`Test database ${testDbName} already exists`);
    }

    // Close the connection
    await sequelize.close();
    return true;
  } catch (error) {
    console.error("Error creating test database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTestDatabase().then(() => process.exit(0));
}

module.exports = createTestDatabase;
