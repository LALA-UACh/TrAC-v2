import knex from "knex";

(async () => {
  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = "development";
  }
  const { NODE_ENV } = await import("../../constants");
  const { baseDBConfig, dbNames } = await import("./config");

  if (NODE_ENV !== "test") {
    const knexDB = knex(baseDBConfig);

    for (const dbName of Object.values(dbNames)) {
      try {
        await knexDB.raw(`CREATE DATABASE "${dbName}";`);
      } catch (err) {
        const message: string = err.message;
        if (!message.includes("already exists")) {
          console.error(message);
          await knexDB.destroy();
          process.exit(1);
        }
      }
    }

    await knexDB.destroy();
  }
})();
