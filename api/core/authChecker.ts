import "reflect-metadata";

import { ADMIN } from "../constants";

import type { IContext } from "../../interfaces";
import type { AuthChecker } from "type-graphql";

export const authChecker: AuthChecker<IContext> = async (
  { context: { req, res, user } },
  roles
) => {
  if (user) {
    for (const role of roles) {
      switch (role) {
        case ADMIN: {
          if (!user.admin) {
            return false;
          }
          break;
        }
        default: {
          return false;
        }
      }
    }
    return true;
  }
  return false;
};
