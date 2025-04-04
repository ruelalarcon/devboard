module.exports = {
  testEnvironment: "node",
  verbose: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: ["**/*.js", "!**/node_modules/**", "!**/coverage/**", "!**/public/**"],
  setupFilesAfterEnv: ["./__tests__/setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/setup.js", "/__tests__/mocks/"],
};
