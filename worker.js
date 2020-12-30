const { workerGitCI } = require("git-polling-worker-ci");

workerGitCI({
  command: "pnpm start-pm2-dev",
  pollingInterval: "45 seconds",
  continueAfterExecution: true,
  directoryChangedScripts: {
    options: [
      {
        directories: ["./package.json", "./pnpm-lock.yaml"],
        script: "pnpm i --frozen-lockfile",
      },
      {
        directories: [
          "./package.json",
          "./pnpm-lock.yaml",
          "./api/",
          "./app.ts",
          "./interfaces/",
        ],
        script: "pnpm build-api",
      },
      {
        directories: [
          "./package.json",
          "./pnpm-lock.yaml",
          "./client/",
          "./interfaces/",
        ],
        script: "pnpm build-client",
      },
    ],
  },
});
