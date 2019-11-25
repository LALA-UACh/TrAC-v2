import knex from "knex";
import pg from "pg";

pg.types.setTypeParser(20, "text", parseInt);
pg.types.setTypeParser(1700, parseFloat);

const dbPassword = process.env.POSTGRES_PASSWORD;

export const dbAuth = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: "auth-lala",
    password: dbPassword,
  },
  // debug: true
});

export const dbLALA = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: "lalauach",
    password: dbPassword,
  },
  // debug: true,
});

export const dbTracking = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: "tracking",
    password: dbPassword,
  },
  // debug: true,
});

export const dbConfig = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: "config",
    password: dbPassword,
  },
  // debug: true,
});

import("./data");
