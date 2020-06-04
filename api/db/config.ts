import "dotenv/config";

import { NODE_ENV } from "../../constants";

import type { Config } from "knex";

const dbPassword = process.env.POSTGRES_PASSWORD;
const dbHost = process.env.POSTGRES_HOST || "localhost";

export const baseDBConfig: Config =
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

export const dbNames = {
  auth: "auth-lala",
  data: "data-lala",
  tracking: "tracking",
  config: "config",
};
