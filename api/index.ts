import "dotenv/config";

import cookieParser from "cookie-parser";
import express from "express";
import { express as voyagerMiddleware } from "graphql-voyager/middleware";
import { toInteger } from "lodash";

import { apolloServer } from "./apollo/server";

const app = express();

app.use(cookieParser());

apolloServer.applyMiddleware({
  app,
  path: "/api/graphql",
});

if (process.env.SHOW_GRAPHQL_API || process.env.NODE_ENV !== "production") {
  console.log("Showing GraphQL API through /api/voyager");

  app.use("/api/voyager", voyagerMiddleware({ endpointUrl: "/api/graphql" }));
}

app.use("/", (_req, res) => res.redirect("/api/graphql"));

const port = process.env.API_PORT ? toInteger(process.env.API_PORT) : 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen({ port }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
    );
  });
}
