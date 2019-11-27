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
  const APIWP = new Watchpack({
    ignored: ["node_modules", ".git", ".next", "logs"],
  });

  APIWP.watch(
    ["api/*", "constants/*", "package.json", "tsconfig.api.json"],
    ["api", "constants"],
    Date.now()
  );

  const buildAndStart = () => {
    installDependencies();
    const build = Shell.exec("yarn build-api", { silent: false });
    if (build.code === 0) {
      const APIReload = Shell.exec(
        `pm2 reload ecosystem.yaml ${
          production ? "--env production" : ""
        } --only api`,
        { silent: true }
      );

      if (APIReload.code === 0) {
        console.log("API Reloaded!");
      }
    }
  };
  APIWP.on("change", async changed => {
    console.log({ changed });
    buildAndStart();
  });
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

  const build = () => {
    installDependencies();
    const yarnBuild = Shell.exec("yarn build", {
      silent: false,
    });

    if (yarnBuild.code === 0) {
      if (reloadNext().code === 0) {
        console.log("Client Reloaded!");
      }
    }
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
      build();
    });
  } else {
    reloadNext();
  }
};

APIWorker();
ClientWorker();

if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    Shell.exec("git pull", { silent: true });
  }, ms("1 minute"));
}
