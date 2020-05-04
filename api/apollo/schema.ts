import "reflect-metadata";

import { EmailAddressResolver } from "graphql-scalars";
import { GraphQLJSON, GraphQLJSONObject } from "graphql-type-json";
import { buildSchemaSync } from "type-graphql";

import { NODE_ENV } from "../../constants";
import * as resolvers from "../resolvers";

import { authChecker } from "./authChecker";

export const schema = buildSchemaSync({
  resolvers: [
    ...Object.values(resolvers),
    GraphQLJSON.toString(),
    GraphQLJSONObject.toString(),
    EmailAddressResolver.toString(),
  ] as any,
  authChecker,
  emitSchemaFile: NODE_ENV !== "production",
  validate: true,
});
