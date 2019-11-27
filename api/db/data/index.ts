import { dbConfig } from "../";
import { baseConfig } from "../../../constants";
import { CONFIGURATION_TABLE, ConfigurationTable } from "../../db/tables";

dbConfig.schema.hasTable(CONFIGURATION_TABLE).then(async exists => {
  if (!exists) {
    await dbConfig.schema.createTable(CONFIGURATION_TABLE, async table => {
      table
        .text("name")
        .primary()
        .defaultTo("");
      table
        .text("value")
        .defaultTo("")
        .notNullable();
    });

    await ConfigurationTable().insert(
      Object.entries(baseConfig).map(([name, valueRaw]) => {
        let value: string;
        if (typeof valueRaw === "number") {
          value = valueRaw.toString();
        } else if (Array.isArray(valueRaw)) {
          value = JSON.stringify(valueRaw, null, 4);
        } else {
          value = valueRaw;
        }
        return {
          name,
          value,
        };
      })
    );
  }
});
