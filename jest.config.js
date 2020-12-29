module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  globals: {
    "ts-jest": {
      tsconfig: "./__tests__/tsconfig.json",
    },
  },
};
