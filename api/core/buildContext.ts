import "fastify-cookie";

import DataLoader from "dataloader";
import { verify } from "jsonwebtoken";
import { keyBy } from "lodash";

import { NODE_ENV } from "../../client/constants";
import { SECRET } from "../constants";
import { IUser, UserConfigurationTable, UserTable } from "../db/tables";
import { AuthResolver } from "../resolvers/auth/auth";

import type { FastifyReply, FastifyRequest } from "fastify";

export const buildContext = async (req: FastifyRequest, res: FastifyReply) => {
  let user: IUser | undefined;
  let token: string | undefined;
  try {
    const authorizationToken: string | undefined =
      req.cookies.authorization || req.headers.authorization;
    if (authorizationToken) {
      const userJWT = verify(authorizationToken, SECRET, {
        ignoreExpiration: NODE_ENV === "development",
      }) as {
        email: string;
      };

      user = await UserTable()
        .select("*")
        .where({ email: userJWT.email, locked: false })
        .first();
      if (user) {
        token = AuthResolver.authenticate({
          req,
          res,
          email: userJWT.email,
        });
      }
    }
  } catch (err) {}

  return {
    req,
    res,
    user,
    token,
    UserConfigDataLoader: new DataLoader(
      async (usersEmails: readonly string[]) => {
        const dataHash = keyBy(
          await UserConfigurationTable()
            .select("config", "email")
            .whereIn("email", usersEmails),
          "email"
        );

        return usersEmails.map((email) => {
          return dataHash[email];
        });
      }
    ),
    UserDataLoader: new DataLoader(async (usersEmails: readonly string[]) => {
      const userDataHash = keyBy(
        await UserTable().select("*").whereIn("email", usersEmails),
        "email"
      );
      return usersEmails.map((email) => {
        return userDataHash[email];
      });
    }),
  };
};
