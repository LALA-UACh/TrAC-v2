import "dotenv/config";

import cookieParser from "cookie-parser";
import express from "express";
import { express as voyagerMiddleware } from "graphql-voyager/middleware";
import helmet from "helmet";
import { toInteger } from "lodash";

import { NODE_ENV } from "../constants";
import { apolloServer } from "./apollo/server";

const app = express();

app.use(helmet.hidePoweredBy());

app.use(helmet.hsts());

app.use(cookieParser());

apolloServer
  .then((apolloServer) => {
    apolloServer.applyMiddleware({
      app,
      path: "/api/graphql",
    });

    if (process.env.SHOW_GRAPHQL_API || NODE_ENV !== "production") {
      console.log("Showing GraphQL API through /api/voyager");

      app.use(
        "/api/voyager",
        voyagerMiddleware({ endpointUrl: "/api/graphql" })
      );
    }

    app.use("/", (_req, res) => res.redirect("/api/graphql"));

    const port = process.env.API_PORT ? toInteger(process.env.API_PORT) : 4000;

    if (NODE_ENV !== "test") {
      app.listen({ port }, () => {
        console.log(
          `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
        );
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });
