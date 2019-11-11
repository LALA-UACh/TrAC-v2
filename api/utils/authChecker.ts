import { AuthChecker } from "type-graphql";

import { IContext } from "@interfaces";

export const authChecker: AuthChecker<IContext> = (
  { context: { req, res, user } },
  roles
) => {
  if (user) {
    return true;
  }
  return false;
};
