import "dotenv/config";

import cookieParser from "cookie-parser";
import express from "express";
import { express as voyagerMiddleware } from "graphql-voyager/middleware";
import helmet from "helmet";
import { toInteger } from "lodash";
import Next from "next";

import { NODE_ENV } from "./constants";
import { apolloServer } from "./api/apollo/server";

export const app = express();

app.use(helmet.hidePoweredBy());

app.use(helmet.hsts());

app.use(cookieParser());

apolloServer.applyMiddleware({
  app,
  path: "/api/graphql",
});

const dev = NODE_ENV !== "production";

const nextApp = Next({
  dev,
  customServer: true,
});

const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  if (process.env.SHOW_GRAPHQL_API || dev) {
    console.log("Showing GraphQL API through /api/voyager");

    app.use("/api/voyager", voyagerMiddleware({ endpointUrl: "/api/graphql" }));
  }

  app.use((req, res) => {
    nextHandler(req, res);
  });

  const port = process.env.PORT ? toInteger(process.env.PORT) : 3000;

  if (NODE_ENV !== "test") {
    app.listen({ port }, () => {
      console.log(`🚀 Server ready at http://localhost:${port}`);
    });

    if (dev) {
      import("axios").then(({ default: { get } }) => {
        get(`http://localhost:${port}/`).catch(console.error);
      });
    }
  }
});
