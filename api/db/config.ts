import "dotenv/config";

import { IS_NOT_TEST } from "../../client/constants";

import type { Config } from "knex";

const dbPassword = process.env.POSTGRES_PASSWORD;
const dbHost = process.env.POSTGRES_HOST || "localhost";

export const baseDBConfig: Config = IS_NOT_TEST
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

export const dbNames = {
  auth: "auth-lala",
  data: "data-lala",
  tracking: "tracking",
  config: "config",
};
