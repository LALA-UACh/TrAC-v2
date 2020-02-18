import knex, { Config } from "knex";
import { merge } from "lodash";
import pg from "pg";

import { NODE_ENV } from "../../constants";

pg.types.setTypeParser(20, "text", parseInt);
pg.types.setTypeParser(1700, parseFloat);

const dbPassword = process.env.POSTGRES_PASSWORD;
const dbHost = process.env.POSTGRES_HOST || "localhost";

const authDbName = "auth-lala";
const dataDbName = "data-lala";
const trackingDbName = "tracking";
const configDbName = "config";

const baseConfig: Config =
  NODE_ENV !== "test"
    ? {
        client: "pg",
        connection: {
          user: "postgres",
          host: dbHost,
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

import("./mockData");
