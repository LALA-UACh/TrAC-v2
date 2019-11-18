import { AuthChecker } from "type-graphql";

import { ADMIN } from "@consts";
import { IContext } from "@interfaces";

export const authChecker: AuthChecker<IContext> = async (
  { context: { req, res, user } },
  roles
) => {
  if (user) {
    for (const role of roles) {
      switch (role) {
        case ADMIN: {
          return user.admin;
        }
        default:
          return false;
      }
    }
    return true;
  }
  return false;
};
