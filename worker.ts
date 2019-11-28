import ms from "ms";
import Shell from "shelljs";
import Watchpack from "watchpack";

const installDependencies = () => {
  Shell.exec("yarn --frozen-lockfile --production=false", { silent: true });
};
const production = process.env.NODE_ENV === "production";
console.log(
  `Worker started in ${production ? "production" : "development"} mode!`
);

const APIWorker = async () => {
  if (production) {
    const APIWP = new Watchpack({
      ignored: ["node_modules", ".git", ".next", "logs"],
    });

    APIWP.watch(
      ["api/*", "constants/*", "package.json", "tsconfig.api.json"],
      ["api", "constants"],
      Date.now()
    );

    APIWP.on("change", async changed => {
      console.log({ changed });
      installDependencies();
      const build = Shell.exec("yarn build-api", { silent: false });
      if (build.code === 0) {
        const APIReload = Shell.exec(
          `pm2 reload ecosystem.yaml --only api-prod`,
          { silent: true }
        );

        if (APIReload.code === 0) {
          console.log("API Reloaded!");
        }
      }
    });
  } else {
    Shell.exec(`yarn build-api -w`, { async: true });
  }
};

const ClientWorker = async () => {
  const reloadNext = () => {
    return Shell.exec(
      `pm2 reload ecosystem.yaml --only ${
        production ? "next-prod" : "next-dev"
      }`,
      { silent: true }
    );
  };

  if (production) {
    const ClientWP = new Watchpack({
      ignored: ["node_modules", ".git", ".next", "logs"],
    });

    ClientWP.watch(
      [
        "src/*",
        "constants/*",
        "public/*",
        "typings/*",
        "package.json",
        "tsconfig.json",
      ],
      ["src", "typings", "public", "constants"],
      Date.now()
    );

    ClientWP.on("change", async changed => {
      console.log({ changed });
      installDependencies();
      const yarnBuild = Shell.exec("yarn build", {
        silent: false,
      });

      if (yarnBuild.code === 0) {
        if (reloadNext().code === 0) {
          console.log("Client Reloaded!");
        }
      }
    });
  }
};

APIWorker();
ClientWorker();

if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    Shell.exec("git fetch && git reset --hard origin/master", {
      silent: true,
    });
  }, ms("1 minute"));
}
