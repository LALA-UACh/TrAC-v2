import assert from "assert";
import { GraphQLJSONObject } from "graphql-type-json";
import { Arg, Authorized, Mutation, Query, Resolver } from "type-graphql";

import { baseConfig, baseConfigAdmin } from "../../constants/baseConfig";
import { configStringToValue } from "../../constants/validation";
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
    @Arg("value") value: string
  ): Promise<typeof baseConfig> {
    assert(
      typeof baseConfigAdmin[name] === typeof configStringToValue(value),
      new Error("Invalid type of configuration value")
    );

    const exists = await ConfigurationTable()
      .select("name")
      .where({
        name,
      })
      .first();

    if (exists) {
      await ConfigurationTable()
        .update({
          value,
        })
        .where({
          name,
        });
    } else {
      await ConfigurationTable().insert({
        name,
        value,
      });
    }

    return await ConfigurationResolver.getConfigData();
  }
  @Query(() => GraphQLJSONObject)
  async config(): Promise<typeof baseConfig> {
    return await ConfigurationResolver.getConfigData();
  }
}
