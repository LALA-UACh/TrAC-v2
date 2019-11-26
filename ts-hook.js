const transpileOnly = true || process.env.NODE_ENV === "production";
const project = "./tsconfig.api.json";
require("ts-node").register({
  project,
  transpileOnly,
});
