import ms from "ms";
import Shell from "shelljs";
import Watchpack from "watchpack";

console.log("Worker started!");

const APIWP = new Watchpack({
  ignored: ["node_modules", ".git", ".next", "logs"],
});

APIWP.watch(
  [
    "api/*",
    "constants/*",
    "package.json",
    "tsconfig.json",
    "tsconfig.api.json",
  ],
  ["api", "constants"],
  Date.now()
);

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

const APIWorker = async () => {
  APIWP.on("change", async changed => {
    console.log({ changed });
    const APIReload = Shell.exec("pm2 reload ecosystem.yaml --only api");

    if (APIReload.code === 0) console.log("API Reloaded!");
  });
};

const ClientWorker = async () => {
  const build = () => {
    const yarnBuild = Shell.exec("yarn build");

    if (yarnBuild.code === 0) {
      const reloadNext = Shell.exec("pm2 reload ecosystem.yaml --only next");
    }
  };
  if (process.env.NODE_ENV === "production") {
    build();
    ClientWP.on("change", async changed => {
      console.log({ changed });
      build();
    });
  }
};

APIWorker();
ClientWorker();

if (process.env.NODE_ENV === "production" && false) {
  setInterval(async () => {
    Shell.exec("git pull", { silent: true });
  }, ms("5 minutes"));
}
