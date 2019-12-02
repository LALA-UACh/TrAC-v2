import { gql } from "apollo-server-express";
import sha1 from "crypto-js/sha1";
import { getTracker, mock, Tracker } from "mock-knex";

import { dbAuth, dbConfig, dbData, dbTracking } from "../api/db";
import { apolloTestClient } from "../api/utils/apolloTestClient";

let tracker: Tracker;

const testingUser = {
  email: "test@test.test",
  password: sha1("test").toString(),
  locked: false,
  admin: true,
  name: "testingUser",
  oldPassword1: "",
  oldPassword2: "",
  oldPassword3: "",
  tries: 0,
  unlockKey: "",
  type: "Director",
  rut_id: "",
  show_dropout: true,
};

let previusConsoleWarn = console.warn;
console.warn = (message: string, ...rest: any[]) => {
  if (
    !(
      message.includes("Unable to acquire a connection") ||
      message.includes("password authentication failed")
    )
  ) {
    previusConsoleWarn(message, ...rest);
  }
};
beforeAll(() => {
  //@ts-ignore
  mock(dbConfig);
  //@ts-ignore
  mock(dbAuth);
  //@ts-ignore
  mock(dbData);
  //@ts-ignore
  mock(dbTracking);
  tracker = getTracker();
  tracker.install();
  tracker.on("query", ({ response, sql, method, bindings }, step) => {
    console.log("QueryDetails", { sql, method, bindings, step });
    switch (sql) {
      case `select * from "users" where "email" = $1 limit $2`:
      case `select * from "users" where "email" = $1 and "locked" = $2 limit $3`:
        return response([testingUser]);
    }
    response([]);
  });
});

afterAll(() => {
  tracker.uninstall();
  console.warn = previusConsoleWarn;
});

describe("authentication", () => {
  test("current user empty", async () => {
    const { query } = apolloTestClient();
    const currentUserResult = await query(gql`
      query {
        currentUser {
          user {
            email
          }
          token
          error
        }
      }
    `);

    expect(currentUserResult.data).toEqual({
      currentUser: {
        user: null,
        token: null,
        error: null,
      },
    });
  });
  test("successful login and currentUser", async () => {
    const { mutate } = apolloTestClient();
    const {
      data: {
        login: { token },
      },
    } = await mutate(
      gql`
        mutation($email: EmailAddress!, $password: String!) {
          login(email: $email, password: $password) {
            user {
              email
            }
            token
            error
          }
        }
      `,
      {
        variables: {
          email: testingUser.email,
          password: testingUser.password,
        },
      }
    );
    expect(token).toBeTruthy();
    const { query } = apolloTestClient({
      headers: {
        authorization: token,
      },
    });
    const {
      data: { currentUser },
    } = await query(gql`
      query {
        currentUser {
          user {
            email
          }
        }
      }
    `);

    expect(currentUser.user.email).toBe(testingUser.email);
  });
});

export {};
