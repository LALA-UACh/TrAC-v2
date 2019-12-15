import "@testing-library/jest-dom/extend-expect";

import React from "react";
import waitForExpect from "wait-for-expect";

import { MockedProvider } from "@apollo/react-testing";
import { act, render } from "@testing-library/react";

import { UserType } from "../constants";
import { baseConfig } from "../constants/baseConfig";
import { ALL_USERS_ADMIN } from "../src/graphql/adminQueries";
import { CURRENT_USER } from "../src/graphql/queries";
import AdminPage from "../src/pages/admin";
import IndexPage from "../src/pages/index";
import LoginPage from "../src/pages/login";
import UnlockPage from "../src/pages/unlock/[email]/[unlockKey]";

jest.mock("next/router", () => ({
  useRouter() {
    return {
      query: {
        email: "asd@gmail.com",
        unlockKey: "asd",
      },
      replace: () => {},
      push: () => {},
    };
  },
}));

describe("unlock", () => {
  test("renders correctly", async () => {
    await act(async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: CURRENT_USER,
              },
              result: {
                data: {
                  currentUser: {
                    user: null,
                  },
                },
              },
            },
          ]}
          addTypename={false}
        >
          <UnlockPage />
        </MockedProvider>
      );

      await waitForExpect(async () => {
        const NewPasswordFieldLabel = getByText(
          baseConfig.UNLOCK_NEW_PASSWORD_LABEL
        );

        expect(NewPasswordFieldLabel).toBeTruthy();
      });
    });
  });
});

describe("login", () => {
  test("renders correctly", async () => {
    await act(async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: CURRENT_USER,
              },
              result: {
                data: {
                  currentUser: {
                    user: null,
                  },
                },
              },
            },
          ]}
          addTypename={false}
        >
          <LoginPage />
        </MockedProvider>
      );

      await waitForExpect(async () => {
        const LoginButton = getByText(baseConfig.LOGIN_BUTTON);

        expect(LoginButton).toBeTruthy();
        expect(LoginButton).toHaveAttribute("disabled");
      });
    });
  });
});

describe("dashboard", () => {
  test("renders correctly", async () => {
    await act(async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: CURRENT_USER,
              },
              result: {
                data: {
                  currentUser: {
                    user: {
                      email: "asd@gmail.com",
                      name: "name",
                      admin: true,
                      type: UserType.Director,
                      show_dropout: true,
                      show_student_list: true,
                      __typename: "User",
                    },
                    __typename: "AuthResult",
                  },
                },
              },
            },
          ]}
          addTypename={true}
        >
          <IndexPage />
        </MockedProvider>
      );

      await waitForExpect(async () => {
        const SearchButton = getByText(baseConfig.SEARCH_BUTTON_LABEL);

        expect(SearchButton).toBeTruthy();
        expect(SearchButton).toHaveAttribute("disabled");
      });
    });
  });
});

describe("admin", () => {
  test("renders correctly", async () => {
    await act(async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: CURRENT_USER,
              },
              result: {
                data: {
                  currentUser: {
                    user: {
                      email: "asd@gmail.com",
                      name: "name",
                      admin: true,
                      type: UserType.Director,
                      show_dropout: true,
                      show_student_list: true,
                      __typename: "User",
                    },
                    __typename: "AuthResult",
                  },
                },
              },
            },
            {
              request: {
                query: ALL_USERS_ADMIN,
              },
              result: {
                data: {
                  users: [],
                },
              },
            },
          ]}
          addTypename={true}
        >
          <AdminPage />
        </MockedProvider>
      );

      await waitForExpect(async () => {
        const UsersMenu = getByText("Users");

        expect(UsersMenu).toBeTruthy();
        expect(UsersMenu).toHaveClass("active");
      });
    });
  });
});

export {};
