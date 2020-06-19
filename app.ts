import "dotenv/config";

import cookieParser from "cookie-parser";
import express from "express";
import { express as voyagerMiddleware } from "graphql-voyager/middleware";
import helmet from "helmet";
import { toInteger } from "lodash";
import Next from "next";

import { apolloServer } from "./api/apollo/server";
import { IS_NOT_PRODUCTION, NODE_ENV } from "./constants";

export const app = express();

app.use(helmet.hidePoweredBy());

app.use(helmet.hsts());

app.use(cookieParser());

app.get("/api/graphql", (_req, res) => {
  res.redirect("/");
});

apolloServer.applyMiddleware({
  app,
  path: "/api/graphql",
});

const nextApp = Next({
  dev: IS_NOT_PRODUCTION,
  customServer: true,
});

const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  if (process.env.SHOW_GRAPHQL_API || IS_NOT_PRODUCTION) {
    console.log("Showing GraphQL API through /api/voyager");

    app.get("/api/voyager", voyagerMiddleware({ endpointUrl: "/api/graphql" }));
  }

  app.use((req, res) => {
    nextHandler(req, res);
  });

  const port = process.env.PORT ? toInteger(process.env.PORT) : 3000;

  if (NODE_ENV !== "test") {
    app.listen({ port }, () => {
      console.log(`🚀 Server ready at http://localhost:${port}`);
    });

    if (IS_NOT_PRODUCTION) {
      import("axios").then(({ default: { get } }) => {
        get(`http://localhost:${port}/`).catch(console.error);
      });
    }
  }
});
