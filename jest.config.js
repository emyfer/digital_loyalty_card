module.exports = {
  testEnvironment: "node",
  testMatch: ["**/testovi/**/*.test.js"],
  setupFilesAfterEnv: ["./testovi/jest.setup.js"],
  verbose: true,
};
