import { ApolloServer } from "apollo-server-express";

import { NODE_ENV } from "../../constants";
import { ComplexityPlugin } from "../utils/complexity";
import { buildContext } from "./buildContext";
import { schema } from "./schema";

export const apolloServer = new ApolloServer({
  schema,
  playground:
    NODE_ENV !== "production"
      ? {
          settings: {
            "request.credentials": "include",
          },
        }
      : false,
  context: ({ req, res }) => buildContext({ req, res }),
  introspection: !!process.env.SHOW_GRAPHQL_API || NODE_ENV !== "production",
  debug: NODE_ENV !== "production",
  tracing: false && NODE_ENV === "development",
  plugins: [ComplexityPlugin],
});
