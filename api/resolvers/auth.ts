import { addMilliseconds } from "date-fns";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { generate } from "randomstring";
import { Args, Ctx, Mutation, Query, Resolver } from "type-graphql";

import {
  defaultUserType,
  LOCKED_USER,
  USED_OLD_PASSWORD,
  WRONG_INFO,
} from "../../constants";
import { IContext } from "../../interfaces";
import { ONE_DAY, SECRET, THIRTY_MINUTES } from "../consts";
import { UserTable } from "../db/tables";
import { AuthResult, LoginInput, UnlockInput } from "../entities/auth";
import { sendMail, UnlockMail } from "../utils/mail";

@Resolver()
export class AuthResolver {
  static authenticate({
    req,
    res,
    email,
  }: {
    req: Request;
    res: Response;
    email: string;
  }) {
    const token = sign({ email }, SECRET, {
      expiresIn: req.cookies?.remember ? "1 day" : "30m",
    });

    res.cookie("authorization", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: addMilliseconds(
        Date.now(),
        req.cookies?.remember ? ONE_DAY : THIRTY_MINUTES
      ),
    });

    return token;
  }

  @Query(() => AuthResult, { nullable: true })
  async currentUser(@Ctx() { user, token }: IContext): Promise<AuthResult> {
    if (user) {
      const foundUser = await UserTable()
        .where({
          email: user.email,
          locked: false,
        })
        .first();
      if (foundUser) {
        return {
          user: {
            ...foundUser,
            type: defaultUserType(foundUser.type),
            programs: [],
          },
          token,
        };
      }
    }

    return {};
  }

  @Mutation(() => AuthResult)
  async login(
    @Ctx() { req, res }: IContext,
    @Args()
    { email, password: passwordInput }: LoginInput
  ): Promise<AuthResult> {
    let user = await UserTable()
      .first()
      .where({
        email,
      });

    if (user) {
      if (user.locked) {
        return { error: LOCKED_USER };
      } else if (user.password === passwordInput) {
        const type = defaultUserType(user.type);
        UserTable()
          .update({
            tries: 0,
          })
          .where({ email })
          .catch(err => JSON.stringify(err, null, 2));
        const token = AuthResolver.authenticate({
          req,
          res,
          email,
        });

        return {
          user: {
            ...user,
            type,
            programs: [],
          },
          token,
        };
      } else {
        if (user.tries && user.tries >= 2) {
          const unlockKey = generate();
          await UserTable()
            .where({ email })
            .update({
              locked: true,
              tries: 3,
              unlockKey,
            });

          await sendMail({
            to: email,
            html: UnlockMail({
              email,
              unlockKey,
            }),
            subject: "Activación cuenta LALA TrAC",
          })
            .then(result => {
              if (process.env.NODE_ENV !== "test") {
                console.log(
                  `New locked user! ${email}`,
                  JSON.stringify(result, null, 2)
                );
              }
            })
            .catch(err => {
              if (process.env.NODE_ENV !== "test") {
                console.error(
                  `Error trying to send an email to new locked user! ${email}`,
                  JSON.stringify(err, null, 2)
                );
              }
            });
          return { error: LOCKED_USER };
        } else {
          await UserTable()
            .increment("tries", 1)
            .where({ email });
        }
      }
    }
    return { error: WRONG_INFO };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { user, res }: IContext) {
    if (user) {
      res.clearCookie("authorization");
      return true;
    }
    return false;
  }

  @Mutation(() => AuthResult)
  async unlock(
    @Ctx() { req, res }: IContext,
    @Args()
    { email, password: passwordInput, unlockKey }: UnlockInput
  ): Promise<AuthResult> {
    let user = await UserTable()
      .where({ email, unlockKey })
      .first();

    if (!user) {
      return { error: WRONG_INFO };
    } else {
      switch (passwordInput) {
        case user.password:
        case user.oldPassword1:
        case user.oldPassword2:
        case user.oldPassword3: {
          return {
            error: USED_OLD_PASSWORD,
          };
        }
        default: {
          const type = defaultUserType(user.type);
          user = (
            await UserTable()
              .where({ email })
              .update({
                password: passwordInput,
                oldPassword1: user.password,
                oldPassword2: user.oldPassword1,
                oldPassword3: user.oldPassword2,
                locked: false,
                tries: 0,
                unlockKey: "",
              })
              .returning("*")
          )[0];
          if (user) {
            const token = AuthResolver.authenticate({
              req,
              res,
              email,
            });
            return {
              user: {
                ...user,
                type,
                programs: [],
              },
              token,
            };
          }
          return { error: WRONG_INFO };
        }
      }
    }
  }
}
