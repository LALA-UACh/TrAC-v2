import cookieParser from "cookie-parser";
import express from "express";
import { toInteger } from "lodash";

import { apolloServer } from "./apollo/server";

const app = express();

app.use(cookieParser());

apolloServer.applyMiddleware({
  app,
  path: "/api/graphql",
});

app.use("/", (_req, res) => res.redirect("/api/graphql"));

const port = process.env.API_PORT ? toInteger(process.env.API_PORT) : 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen({ port }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
    );
  });
}
