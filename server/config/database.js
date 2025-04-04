require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      dateStrings: true,
      typeCast: function (field, next) {
        if (field.type === "DATETIME" || field.type === "TIMESTAMP") {
          return field.string();
        }
        return next();
      },
    },
    timezone: "+00:00", // UTC
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.TEST_DB_NAME || "programming_channel_test",
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Disable logging in test mode
    dialectOptions: {
      dateStrings: true,
      typeCast: function (field, next) {
        if (field.type === "DATETIME" || field.type === "TIMESTAMP") {
          return field.string();
        }
        return next();
      },
    },
    timezone: "+00:00", // UTC
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: function (field, next) {
        if (field.type === "DATETIME" || field.type === "TIMESTAMP") {
          return field.string();
        }
        return next();
      },
    },
    timezone: "+00:00", // UTC
  },
};
