import knex, { Config } from "knex";
import { merge } from "lodash";
import pg from "pg";

pg.types.setTypeParser(20, "text", parseInt);
pg.types.setTypeParser(1700, parseFloat);

const dbPassword = process.env.POSTGRES_PASSWORD;

const authDbName = "auth-lala";
const dataDbName = "lalauach";
const trackingDbName = "tracking";
const configDbName = "config";

const baseConfig: Config =
  process.env.NODE_ENV !== "test"
    ? {
        client: "pg",
        connection: {
          host: "localhost",
          user: "postgres",
          password: dbPassword,
        },
      }
    : {
        client: "pg",
      };

export const dbAuth = knex({
  ...merge<Config, Config>(baseConfig, {
    connection: {
      database: authDbName,
    },
  }),

  // debug: true
});

export const dbData = knex({
  ...merge<Config, Config>(baseConfig, {
    connection: {
      database: dataDbName,
    },
  }),

  // debug: true,
});

export const dbTracking = knex({
  ...merge<Config, Config>(baseConfig, {
    connection: {
      database: trackingDbName,
    },
  }),
  // debug: true,
});

export const dbConfig = knex({
  ...merge<Config, Config>(baseConfig, {
    connection: {
      database: configDbName,
    },
  }),
  // debug: true,
});

import("./data");
