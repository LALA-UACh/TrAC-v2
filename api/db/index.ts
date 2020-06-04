import knex, { Config } from "knex";
import { merge } from "lodash/fp";
import pg from "pg";

import { baseDBConfig, dbNames } from "./config";

pg.types.setTypeParser(20, "text", parseInt);
pg.types.setTypeParser(1700, parseFloat);

export const dbAuth = knex({
  ...merge<Config, Config>(baseDBConfig, {
    connection: {
      database: dbNames.auth,
    },
  }),

  // debug: true
});

export const dbData = knex({
  ...merge<Config, Config>(baseDBConfig, {
    connection: {
      database: dbNames.data,
    },
  }),

  // debug: true,
});

export const dbTracking = knex({
  ...merge<Config, Config>(baseDBConfig, {
    connection: {
      database: dbNames.tracking,
    },
  }),
  // debug: true,
});

export const dbConfig = knex({
  ...merge<Config, Config>(baseDBConfig, {
    connection: {
      database: dbNames.config,
    },
  }),
  // debug: true,
});
