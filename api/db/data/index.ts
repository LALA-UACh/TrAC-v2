import sha1 from "crypto-js/sha1";

import { dbAuth, dbConfig, dbTracking } from "../";
import { baseConfig, UserType } from "../../../constants";
import {
  CONFIGURATION_TABLE,
  ConfigurationTable,
  TRACKING_TABLE,
  USER_PROGRAMS_TABLE,
  USERS_TABLE,
  UserTable,
} from "../../db/tables";

(async () => {
  dbAuth.schema.hasTable(USERS_TABLE).then(async exists => {
    if (!exists) {
      await dbAuth.schema.createTable(USERS_TABLE, table => {
        table.text("email").primary();
        table
          .text("password")
          .notNullable()
          .defaultTo("");
        table
          .text("name")
          .notNullable()
          .defaultTo("Default");
        table
          .text("oldPassword1")
          .notNullable()
          .defaultTo("");
        table
          .text("oldPassword2")
          .notNullable()
          .defaultTo("");
        table
          .text("oldPassword3")
          .notNullable()
          .defaultTo("");
        table
          .boolean("locked")
          .notNullable()
          .defaultTo(true);
        table
          .integer("tries")
          .notNullable()
          .defaultTo(0);
        table
          .text("unlockKey")
          .notNullable()
          .defaultTo("");
        table
          .boolean("admin")
          .notNullable()
          .defaultTo(false);
        table
          .enum("type", Object.values(UserType))
          .notNullable()
          .defaultTo(UserType.Student);
        table
          .text("rut_id")
          .notNullable()
          .defaultTo("");
        table
          .boolean("show_dropout")
          .notNullable()
          .defaultTo(false);
      });

      await UserTable().insert({
        email: "admin@admin.dev",
        password: sha1("admin").toString(),
        name: "default admin",
        locked: false,
        admin: true,
        type: UserType.Director,
        show_dropout: true,
      });
    }
  });

  dbAuth.schema.hasTable(USER_PROGRAMS_TABLE).then(async exists => {
    if (!exists) {
      await dbAuth.schema.createTable(USER_PROGRAMS_TABLE, table => {
        table.text("email");
        table.text("program");
        table.primary(["email", "program"]);
      });
    }
  });

  dbConfig.schema.hasTable(CONFIGURATION_TABLE).then(async exists => {
    if (!exists) {
      await dbConfig.schema.createTable(CONFIGURATION_TABLE, table => {
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

  dbTracking.schema.hasTable(TRACKING_TABLE).then(async exists => {
    if (!exists) {
      await dbTracking.schema.createTable(TRACKING_TABLE, table => {
        table
          .bigIncrements("id")
          .primary()
          .unsigned();
        table
          .text("app_id")
          .notNullable()
          .defaultTo("undefined");
        table.text("user_id").notNullable();
        table.timestamp("datetime", { useTz: true }).notNullable();
        table.timestamp("datetime_client", { useTz: true }).notNullable();
        table.text("data").notNullable();
      });
    }
  });
})();
