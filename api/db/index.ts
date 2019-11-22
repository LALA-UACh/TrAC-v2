import knex from "knex";

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
