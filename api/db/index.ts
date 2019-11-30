import knex from "knex";
import pg from "pg";

pg.types.setTypeParser(20, "text", parseInt);
pg.types.setTypeParser(1700, parseFloat);

const dbPassword = process.env.POSTGRES_PASSWORD;

const authDbName = "auth-lala";
const dataDbName = "lalauach";
const trackingDbName = "tracking";
const configDbName = "config";

export const dbAuth = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: authDbName,
    password: dbPassword,
  },
  // debug: true
});

export const dbData = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: dataDbName,
    password: dbPassword,
  },
  // debug: true,
});

export const dbTracking = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: trackingDbName,
    password: dbPassword,
  },
  // debug: true,
});

export const dbConfig = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: configDbName,
    password: dbPassword,
  },
  // debug: true,
});

import("./data");
