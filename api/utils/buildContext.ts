import { Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { SECRET } from "@consts";
import { AuthResolver } from "@resolvers/auth";

export const buildContext = ({ req, res }: { req: Request; res: Response }) => {
  let user: { email: string; admin: boolean } | undefined;

  try {
    if (req.cookies.authorization) {
      user = verify(req.cookies.authorization, SECRET) as {
        email: string;
        admin: boolean;
      };
      AuthResolver.authenticate({
        req,
        res,
        email: user.email,
        admin: user.admin,
      });
    }
  } catch {}

  return {
    req,
    res,
    user,
  };
};
