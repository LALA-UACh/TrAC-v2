module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  globals: {
    "ts-jest": {
      tsConfig: "api/tsconfig.json",
    },
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
};
