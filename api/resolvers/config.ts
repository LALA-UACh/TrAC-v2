import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { GraphQLJSONObject } from "graphql-type-json";
import { toNumber } from "lodash";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { isNumeric } from "validator";

import { baseConfig } from "../../constants/baseConfig";
import { UserConfig } from "../../constants/userConfig";
import { ConfigurationTable, UserConfigurationTable } from "../db/tables";
import { User } from "../entities/auth/user";

@Resolver()
export class ConfigurationResolver {
  @Query(() => GraphQLJSONObject)
  async config(): Promise<typeof baseConfig> {
    const data = await ConfigurationTable().select("*");

    return data.reduce<Record<string, any> & typeof baseConfig>(
      (acum, { name, value }) => {
        if (isNumeric(value)) {
          acum[name] = toNumber(value);
        } else {
          acum[name] = value;
        }

        return acum;
      },
      baseConfig
    );
  }

  @Mutation(() => User)
  async updateUserConfig(
    @Arg("email", () => EmailAddress) email: string,
    @Arg("config", () => GraphQLJSONObject) config: UserConfig
  ) {
    let userConfig = await UserConfigurationTable()
      .select("config")
      .where({ email });

    if (!userConfig) {
      userConfig = await UserConfigurationTable()
        .insert({
          email,
          config,
        })
        .returning("config");
    } else {
      userConfig = await UserConfigurationTable()
        .update({
          config,
        })
        .where({ email })
        .returning("config");
    }
  }
}
