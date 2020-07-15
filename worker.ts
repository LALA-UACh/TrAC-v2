import { workerGitCI } from "git-polling-worker-ci";

workerGitCI({
  command: "yarn --frozen-lockfile && yarn build-client && yarn start-pm2-dev",
  pollingInterval: "30 seconds",
  continueAfterExecution: true,
});
