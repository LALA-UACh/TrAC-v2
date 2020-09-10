const { workerGitCI } = require("git-polling-worker-ci");

workerGitCI({
  command: "yarn start-pm2-dev",
  pollingInterval: "45 seconds",
  continueAfterExecution: true,
  directoryChangedScripts: {
    options: [
      {
        directories: ["./package.json", "./yarn.lock"],
        script: "yarn --frozen-lockfile",
      },
      {
        directories: [
          "./package.json",
          "./yarn.lock",
          "./api/",
          "./app.ts",
          "./interfaces/",
        ],
        script: "yarn build-api",
      },
      {
        directories: [
          "./package.json",
          "./yarn.lock",
          "./client/",
          "./interfaces/",
        ],
        script: "yarn build-client",
      },
    ],
  },
});
