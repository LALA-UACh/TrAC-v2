import "reflect-metadata";

import { ApolloServer } from "apollo-server-express";
import { EmailAddressResolver } from "graphql-scalars";
import { GraphQLJSON, GraphQLJSONObject } from "graphql-type-json";
import { buildSchemaSync } from "type-graphql";
import { NonEmptyArray } from "type-graphql/dist/utils/types";

import * as resolvers from "../resolvers";
import { authChecker } from "./authChecker";
import { buildContext } from "./buildContext";

const schema = buildSchemaSync({
  resolvers: [
    ...Object.values(resolvers),
    GraphQLJSON.toString(),
    GraphQLJSONObject.toString(),
    EmailAddressResolver.toString(),
  ] as NonEmptyArray<Function> | NonEmptyArray<string>,
  authChecker,
  emitSchemaFile: process.env.NODE_ENV !== "production",
  validate: true,
});

export const apolloServer = new ApolloServer({
  schema,
  playground:
    process.env.NODE_ENV !== "production"
      ? {
          settings: {
            "request.credentials": "include",
          },
        }
      : false,
  context: ({ req, res }) => buildContext({ req, res }),
  introspection:
    !!process.env.SHOW_GRAPHQL_API || process.env.NODE_ENV !== "production",
  debug: process.env.NODE_ENV !== "production",
});
