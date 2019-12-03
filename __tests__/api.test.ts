import { gql } from "apollo-server-express";
import sha1 from "crypto-js/sha1";
import { set, update } from "lodash";
import { getTracker, mock, Tracker } from "mock-knex";

import { dbAuth, dbConfig, dbData, dbTracking } from "../api/db";
import { apolloTestClient } from "../api/utils/apolloTestClient";
import {
  LOCKED_USER,
  USED_OLD_PASSWORD,
  UserType,
  WRONG_INFO,
} from "../constants";

const testingUserOk = {
  email: "test@test.test",
  password: sha1("test").toString(),
  locked: false,
  admin: true,
  name: "testingUser",
  oldPassword1: sha1("oldPass1").toString(),
  oldPassword2: "",
  oldPassword3: "",
  tries: 0,
  unlockKey: "",
  type: UserType.Director,
  rut_id: "",
  show_dropout: true,
};

const testingUserLock = {
  email: "test2@test.test",
  password: sha1("test2").toString(),
  locked: false,
  admin: true,
  name: "testingUserLock",
  oldPassword1: sha1("oldPass1").toString(),
  oldPassword2: sha1("oldPass2").toString(),
  oldPassword3: sha1("oldPass3").toString(),
  tries: 0,
  unlockKey: "",
  type: UserType.Student,
  rut_id: "",
  show_dropout: true,
};

const usersTable = [testingUserOk, testingUserLock];

let tracker: Tracker;
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
  mock(dbConfig as any);
  mock(dbAuth as any);
  mock(dbData as any);
  mock(dbTracking as any);

  tracker = getTracker();
  tracker.install();
  tracker.on("query", ({ response, sql, method, bindings }, step) => {
    switch (sql) {
      case `select * from "users" where "email" = $1 limit $2`: {
        return response(
          usersTable
            .filter(({ email }) => {
              return email === bindings[0];
            })
            .slice(0, (bindings[1] as number) + 1)
        );
      }
      case `select * from "users" where "email" = $1 and "locked" = $2 limit $3`: {
        return response(
          usersTable
            .filter(({ email, locked }) => {
              return email === bindings[0] && locked === bindings[1];
            })
            .slice(0, (bindings[2] as number) + 1)
        );
      }
      case `update "users" set "tries" = $1 where "email" = $2`: {
        const userIndex = usersTable.findIndex(({ email }) => {
          return email === bindings[1];
        });
        set(usersTable, [userIndex, "tries"], bindings[0]);
        return response([]);
      }
      case `update "users" set "tries" = "tries" + $1 where "email" = $2`: {
        const userIndex = usersTable.findIndex(({ email }) => {
          return email === bindings[1];
        });
        update(usersTable, [userIndex, "tries"], (tries: number) => {
          return tries + (bindings[0] as number);
        });
        return response([]);
      }
      case `update "users" set "locked" = $1, "tries" = $2, "unlockKey" = $3 where "email" = $4`: {
        const userIndex = usersTable.findIndex(({ email }) => {
          return email === bindings[3];
        });
        update(usersTable, userIndex, user => {
          user.locked = bindings[0];
          user.tries = bindings[1];
          user.unlockKey = bindings[2];
          return user;
        });

        return response([]);
      }
      case `select * from "users" where "email" = $1 and "unlockKey" = $2 limit $3`: {
        const foundUsers = usersTable
          .filter(({ email, unlockKey }) => {
            return email === bindings[0] && unlockKey === bindings[1];
          })
          .slice(0, (bindings[2] as number) + 1);
        return response(foundUsers);
      }
      case `update "users" set "password" = $1, "oldPassword1" = $2, "oldPassword2" = $3, "oldPassword3" = $4, "locked" = $5, "tries" = $6, "unlockKey" = $7 where "email" = $8 returning *`: {
        const userIndex = usersTable.findIndex(({ email }) => {
          return email === bindings[7];
        });
        update(usersTable, userIndex, user => {
          user.password = bindings[0];
          user.oldPassword1 = bindings[1];
          user.oldPassword2 = bindings[2];
          user.oldPassword3 = bindings[3];
          user.locked = bindings[4];
          user.tries = bindings[5];
          user.unlockKey = bindings[6];
          return user;
        });

        const returningUsers = usersTable.filter(({ email }) => {
          return email === bindings[7];
        });
        return response(returningUsers);
      }
      default: {
        console.log("Unresolved Query Details", {
          sql,
          method,
          bindings,
          step,
        });
        return response([]);
      }
    }
  });
});

afterAll(() => {
  tracker.uninstall();
  console.warn = previusConsoleWarn;
});

describe("authentication", () => {
  test("current user empty", async () => {});
  test("successful login and currentUser", async () => {
    let { query, mutate } = apolloTestClient();

    const currentUserEmpty = await query(gql`
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

    expect(currentUserEmpty.data).toEqual({
      currentUser: {
        user: null,
        token: null,
        error: null,
      },
    });

    const loginFail = await mutate(
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
          email: testingUserOk.email,
          password: testingUserOk.oldPassword1,
        },
      }
    );
    expect(loginFail.data.login.token).toBeNull();
    expect(loginFail.data.login.user).toBeNull();
    expect(loginFail.data.login.error).toBe(WRONG_INFO);

    const loginSuccess = await mutate(
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
          email: testingUserOk.email,
          password: testingUserOk.password,
        },
      }
    );
    expect(loginSuccess.data.login.token).toBeTruthy();
    expect(loginSuccess.data.login.error).toBeNull();

    query = apolloTestClient({
      headers: {
        authorization: loginSuccess.data.login.token,
      },
    }).query;

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

    expect(currentUser.user.email).toBe(testingUserOk.email);
  });

  test("lock and unlock user", async () => {
    const loginGql = gql`
      mutation($email: EmailAddress!, $password: String!) {
        login(email: $email, password: $password) {
          token
          error
        }
      }
    `;
    const { mutate } = apolloTestClient();

    const wrongPassword = sha1("wrong").toString();

    const loginTry1 = await mutate(loginGql, {
      variables: {
        email: testingUserLock.email,
        password: wrongPassword,
      },
    });

    expect(loginTry1.data.login.error).toBe(WRONG_INFO);
    expect(loginTry1.data.login.token).toBeNull();

    const loginTry2 = await mutate(loginGql, {
      variables: {
        email: testingUserLock.email,
        password: wrongPassword,
      },
    });

    expect(loginTry2.data.login.error).toBe(WRONG_INFO);
    expect(loginTry2.data.login.token).toBeNull();

    const loginTry3 = await mutate(loginGql, {
      variables: {
        email: testingUserLock.email,
        password: wrongPassword,
      },
    });
    expect(loginTry3.data.login.error).toBe(LOCKED_USER);
    expect(loginTry3.data.login.token).toBeNull();

    expect(testingUserLock.unlockKey).toBeTruthy();

    const unlockGql = gql`
      mutation($email: EmailAddress!, $unlockKey: String!, $password: String!) {
        unlock(email: $email, unlockKey: $unlockKey, password: $password) {
          user {
            email
          }
          error
          token
        }
      }
    `;
    const unlockTryCurrentPassword = await mutate(unlockGql, {
      variables: {
        email: testingUserLock.email,
        unlockKey: testingUserLock.unlockKey,
        password: testingUserLock.password,
      },
    });

    expect(unlockTryCurrentPassword.data.unlock.user).toBeNull();
    expect(unlockTryCurrentPassword.data.unlock.token).toBeNull();
    expect(unlockTryCurrentPassword.data.unlock.error).toBe(USED_OLD_PASSWORD);

    const unlockTryOldPassword1 = await mutate(unlockGql, {
      variables: {
        email: testingUserLock.email,
        unlockKey: testingUserLock.unlockKey,
        password: testingUserLock.oldPassword1,
      },
    });

    expect(unlockTryOldPassword1.data.unlock.user).toBeNull();
    expect(unlockTryOldPassword1.data.unlock.token).toBeNull();
    expect(unlockTryOldPassword1.data.unlock.error).toBe(USED_OLD_PASSWORD);

    const unlockTryOldPassword2 = await mutate(unlockGql, {
      variables: {
        email: testingUserLock.email,
        unlockKey: testingUserLock.unlockKey,
        password: testingUserLock.oldPassword2,
      },
    });

    expect(unlockTryOldPassword2.data.unlock.user).toBeNull();
    expect(unlockTryOldPassword2.data.unlock.token).toBeNull();
    expect(unlockTryOldPassword2.data.unlock.error).toBe(USED_OLD_PASSWORD);

    const unlockTryOldPassword3 = await mutate(unlockGql, {
      variables: {
        email: testingUserLock.email,
        unlockKey: testingUserLock.unlockKey,
        password: testingUserLock.oldPassword3,
      },
    });

    expect(unlockTryOldPassword3.data.unlock.user).toBeNull();
    expect(unlockTryOldPassword3.data.unlock.token).toBeNull();
    expect(unlockTryOldPassword3.data.unlock.error).toBe(USED_OLD_PASSWORD);

    const unlockTryWrong = await mutate(unlockGql, {
      variables: {
        email: testingUserOk.email,
        unlockKey: testingUserLock.unlockKey,
        password: testingUserLock.password,
      },
    });

    expect(unlockTryWrong.data.unlock.user).toBeNull();
    expect(unlockTryWrong.data.unlock.token).toBeNull();
    expect(unlockTryWrong.data.unlock.error).toBe(WRONG_INFO);

    const newPassword = sha1("new_password").toString();

    const oldTestingUserLock = { ...testingUserLock };

    const unlockTrySuccess = await mutate(unlockGql, {
      variables: {
        email: testingUserLock.email,
        unlockKey: testingUserLock.unlockKey,
        password: newPassword,
      },
    });

    expect(unlockTrySuccess.data.unlock.error).toBeNull();
    expect(unlockTrySuccess.data.unlock.token).toBeTruthy();

    expect(testingUserLock.password).toBe(newPassword);

    expect(testingUserLock.oldPassword1).toBe(oldTestingUserLock.password);
    expect(testingUserLock.oldPassword2).toBe(oldTestingUserLock.oldPassword1);
    expect(testingUserLock.oldPassword3).toBe(oldTestingUserLock.oldPassword2);

    const { query } = apolloTestClient({
      headers: {
        authorization: unlockTrySuccess.data.unlock.token,
      },
    });

    const currentUser = await query(gql`
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

    expect(currentUser.data.currentUser.user.email).toBe(testingUserLock.email);
    expect(currentUser.data.currentUser.token).toBeTruthy();
    expect(currentUser.data.currentUser.error).toBeNull();
  });
});

export {};
