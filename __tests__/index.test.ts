import { getTracker, mock, Tracker } from "mock-knex";

import { dbConfig } from "../api/db";
import { ConfigurationTable } from "../api/db/tables";

let tracker: Tracker;

let previusConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = (message: string, ...rest: any[]) => {
    if (!message.includes("Unable to acquire a connection")) {
      previusConsoleWarn(message, ...rest);
    }
  };

  //@ts-ignore
  mock(dbConfig);
  tracker = getTracker();
  tracker.install();
  tracker.on("query", query => {
    console.log("QueryDetails", query);
    query.response([]);
  });
});

afterAll(() => {
  tracker.uninstall();
  console.warn = previusConsoleWarn;
});

describe("testing", () => {
  test("test", async () => {
    const found = await ConfigurationTable().select("*");
    console.log("found", found);
    expect(Array.isArray(found)).toBe(true);
  });
});

export {};
