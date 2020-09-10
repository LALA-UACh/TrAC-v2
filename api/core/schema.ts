import "reflect-metadata";

import { EmailAddressResolver } from "graphql-scalars";
import { GraphQLJSON, GraphQLJSONObject } from "graphql-type-json";
import { buildSchemaSync } from "type-graphql";

import { IS_DEVELOPMENT } from "../../client/constants";
import * as resolvers from "../resolvers";
import { authChecker } from "./authChecker";

export const schema = buildSchemaSync({
  resolvers: [
    ...(Object.values(resolvers) as []),
    GraphQLJSON.toString(),
    GraphQLJSONObject.toString(),
    EmailAddressResolver.toString(),
  ],
  authChecker,
  emitSchemaFile: IS_DEVELOPMENT,
  validate: true,
});
