import "reflect-metadata";

import { ApolloServer } from "apollo-server-express";
import { EmailAddressResolver } from "graphql-scalars";
import { GraphQLJSON, GraphQLJSONObject } from "graphql-type-json";
import { buildSchema } from "type-graphql";
import { NonEmptyArray } from "type-graphql/dist/utils/types";

import { NODE_ENV } from "../../constants";
import * as resolvers from "../resolvers";
import { ComplexityPlugin } from "../utils/complexity";
import { authChecker } from "./authChecker";
import { buildContext } from "./buildContext";

export const schema = buildSchema({
  resolvers: [
    ...Object.values(resolvers),
    GraphQLJSON.toString(),
    GraphQLJSONObject.toString(),
    EmailAddressResolver.toString(),
  ] as NonEmptyArray<Function> | NonEmptyArray<string>,
  authChecker,
  emitSchemaFile: NODE_ENV !== "production",
  validate: true,
});

export const apolloServer = new Promise<ApolloServer>((resolve, reject) => {
  schema
    .then((schema) => {
      resolve(
        new ApolloServer({
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
          introspection:
            !!process.env.SHOW_GRAPHQL_API || NODE_ENV !== "production",
          debug: NODE_ENV !== "production",
          tracing: false && NODE_ENV === "development",
          plugins: [ComplexityPlugin],
        })
      );
    })
    .catch(reject);
});
