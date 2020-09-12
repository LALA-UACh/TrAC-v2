const path = require("path");
module.exports = {
  client: {
    service: {
      name: "server-app",
      localSchemaFile: path.resolve(__dirname, "./schema.gql"),
      endpoint: null,
    },
    includes: ["client/src/graphql/*.gql"],
  },
};
