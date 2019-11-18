import knex from "knex";

export const dbAuth = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: "auth-lala"
  }
  // debug: true
});

export const dbLALA = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    database: "lalauach"
  }
});
