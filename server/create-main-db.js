// Script to create the main database if it doesn't exist
require("dotenv").config();
const { Sequelize } = require("sequelize");

// Get database configuration from environment variables
const dbName = process.env.DB_NAME || "programming_channel_db";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbHost = process.env.DB_HOST || "localhost";

async function createMainDatabase() {
  console.log(`Checking for main database: ${dbName}`);

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
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`
    );

    if (results.length === 0) {
      // Database doesn't exist, create it
      await sequelize.query(`CREATE DATABASE ${dbName}`);
      console.log(`Created main database: ${dbName}`);
    } else {
      console.log(`Main database ${dbName} already exists`);
    }

    // Close the connection
    await sequelize.close();
    return true;
  } catch (error) {
    console.error("Error creating main database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createMainDatabase().then(() => process.exit(0));
}

module.exports = createMainDatabase;
