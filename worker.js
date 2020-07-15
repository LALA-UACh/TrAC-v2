const { workerGitCI } = require("git-polling-worker-ci");

workerGitCI({
  command: "yarn --frozen-lockfile && yarn build-client && yarn start-pm2-dev",
  pollingInterval: "45 seconds",
  continueAfterExecution: true,
});
