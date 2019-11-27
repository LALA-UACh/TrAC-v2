import { GraphQLJSONObject } from "graphql-type-json";
import { toNumber } from "lodash";
import { Query, Resolver } from "type-graphql";
import { isJSON, isNumeric } from "validator";

import { baseConfig } from "../../constants";
import { ConfigurationTable } from "../db/tables";

@Resolver()
export class ConfigurationResolver {
  @Query(() => GraphQLJSONObject)
  async config(): Promise<typeof baseConfig> {
    const data = await ConfigurationTable().select("*");

    return data.reduce<Record<string, any> & typeof baseConfig>(
      (acum, { name, value }) => {
        if (name === "PASS_GRADE") {
          if (isNumeric(value)) {
            acum[name] = toNumber(value);
          }
        } else if (name === "RANGE_GRADES") {
          if (isJSON(value) && Array.isArray(JSON.parse(value))) {
            acum[name] = JSON.parse(value);
          }
        } else {
          acum[name] = value;
        }

        return acum;
      },
      baseConfig
    );
  }
}
