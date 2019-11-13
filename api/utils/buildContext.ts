import { Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { SECRET } from "@consts";
import { AuthResolver } from "@resolvers";

export const buildContext = ({ req, res }: { req: Request; res: Response }) => {
  let user: { email: string } | undefined;

  try {
    if (req.cookies.authorization) {
      user = verify(req.cookies.authorization, SECRET) as { email: string };
      AuthResolver.authenticate({ req, res, email: user.email });
    }
  } catch {}

  return {
    req,
    res,
    user
  };
};
