import { ApolloServer } from "apollo-server-express";

import { IS_NOT_PRODUCTION, NODE_ENV } from "../../constants";
import { ComplexityPlugin } from "../utils/complexity";
import { buildContext } from "./buildContext";
import { schema } from "./schema";

export const apolloServer = new ApolloServer({
  schema,
  playground: IS_NOT_PRODUCTION
    ? {
        settings: {
          "request.credentials": "include",
        },
      }
    : false,
  context: ({ req, res }) => buildContext({ req, res }),
  introspection: !!process.env.SHOW_GRAPHQL_API || IS_NOT_PRODUCTION,
  debug: IS_NOT_PRODUCTION,
  tracing: false && NODE_ENV === "development",
  plugins: [ComplexityPlugin],
});
