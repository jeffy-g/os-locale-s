
module.exports = {
  testEnvironment: "node",
  testEnvironmentOptions: {
    printSync: false,
    printAsync: false
  },
  verbose: true,
  testRegex: "test\\.js$",
  collectCoverage: true,
  collectCoverageFrom: [
    "./cjs/index.js",
  ],
  moduleFileExtensions: [
    "js"
  ],
  projects: ["<rootDir>"]
};
