import { Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { UserType } from "../../constants";
import { SECRET } from "../consts";
import { AuthResolver } from "../resolvers/auth";

export const buildContext = ({ req, res }: { req: Request; res: Response }) => {
  let user: { email: string; admin: boolean; type: UserType } | undefined;
  let token: string | undefined;
  try {
    if (req.cookies.authorization) {
      user = verify(req.cookies.authorization, SECRET) as {
        email: string;
        admin: boolean;
        type: UserType;
      };
      token = AuthResolver.authenticate({
        req,
        res,
        email: user.email,
        admin: user.admin,
        type: user.type,
      });
    }
  } catch {}

  return {
    req,
    res,
    user,
    token,
  };
};
