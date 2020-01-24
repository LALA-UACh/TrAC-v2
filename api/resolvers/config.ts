import assert from "assert";
import { GraphQLJSONObject } from "graphql-type-json";
import { Arg, Authorized, Mutation, Query, Resolver } from "type-graphql";

import { baseConfig, baseConfigAdmin } from "../../constants/baseConfig";
import {
  configStringToValue,
  configValueToString,
} from "../../constants/validation";
import { ADMIN } from "../api_constants";
import { ConfigurationTable } from "../db/tables";

@Resolver()
export class ConfigurationResolver {
  static async getConfigData() {
    const data = await ConfigurationTable().select("*");

    return data.reduce<Record<string, any> & typeof baseConfig>(
      (acum, { name, value }) => {
        acum[name] = configStringToValue(value);
        return acum;
      },
      baseConfig
    );
  }

  @Authorized([ADMIN])
  @Mutation(() => GraphQLJSONObject)
  async editConfig(
    @Arg("name") name: string,
    @Arg("value") valueStr: string
  ): Promise<typeof baseConfig> {
    assert(
      typeof baseConfigAdmin[name] === typeof configStringToValue(valueStr),
      new Error("Invalid type of configuration value")
    );

    await ConfigurationTable()
      .update({
        value: configValueToString(valueStr),
      })
      .where({
        name,
      });

    return await ConfigurationResolver.getConfigData();
  }
  @Query(() => GraphQLJSONObject)
  async config(): Promise<typeof baseConfig> {
    return await ConfigurationResolver.getConfigData();
  }
}
