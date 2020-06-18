module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
  },
  globals: {
    "ts-jest": {
      tsConfig: {
        incremental: true,
        target: "es2018",
        module: "commonjs",
        jsx: "react",
        sourceMap: true,
        skipLibCheck: true,
        strict: true,
        strictPropertyInitialization: false,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        resolveJsonModule: true,
        forceConsistentCasingInFileNames: true,
        noImplicitAny: false,
      },
    },
  },
};
