import "reflect-metadata";

import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import express from "express";
import { EmailAddressResolver } from "graphql-scalars";
import { GraphQLJSON, GraphQLJSONObject } from "graphql-type-json";
import { buildSchema } from "type-graphql";

import * as resolvers from "./resolvers";
import { authChecker } from "./utils/authChecker";
import { buildContext } from "./utils/buildContext";

const schema = buildSchema({
  resolvers: [
    ...Object.values(resolvers),
    GraphQLJSON.toString(),
    GraphQLJSONObject.toString(),
    EmailAddressResolver.toString(),
  ],
  authChecker,
  emitSchemaFile: true,
  validate: true,
});

const app = express();

const cookieParserRouter = cookieParser();
app.use(cookieParserRouter);

(async () => {
  const apolloServer = new ApolloServer({
    schema: await schema,
    playground: {
      settings: {
        "request.credentials": "include",
      },
    },
    context: ({ req, res }) => buildContext({ req, res }),
    introspection: true,
    debug: process.env.NODE_ENV !== "production",
  });
  apolloServer.applyMiddleware({
    app,
    path: "/api/graphql",
  });

  app.use("/", (req, res) => res.redirect("/api/graphql"));

  app.listen({ port: 4000 }, () =>
    console.log(
      `🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`
    )
  );
})();
