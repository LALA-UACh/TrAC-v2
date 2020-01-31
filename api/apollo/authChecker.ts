import { AuthChecker } from "type-graphql";

import { IContext } from "../../interfaces";
import { ADMIN } from "../api_constants";

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
