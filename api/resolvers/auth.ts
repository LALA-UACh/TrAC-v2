import { addMilliseconds } from "date-fns";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { generate } from "randomstring";
import { Args, Ctx, Mutation, Query, Resolver } from "type-graphql";

import {
  LOCKED_USER,
  USED_OLD_PASSWORD,
  UserType,
  WRONG_INFO,
} from "@constants";
import { ONE_DAY, SECRET, THIRTY_MINUTES, USERS_TABLE } from "@consts";
import { dbAuth } from "@db";
import { AuthResult, LoginInput, UnlockInput } from "@entities/auth";
import { User } from "@entities/user";
import { IContext } from "@interfaces";
import { sendMail, UnlockMail } from "@utils/mail";

@Resolver()
export class AuthResolver {
  static authenticate({
    req,
    res,
    email,
    admin,
    type,
  }: {
    req: Request;
    res: Response;
    email: string;
    admin: boolean;
    type: UserType;
  }) {
    res.cookie(
      "authorization",
      sign({ email, admin, type }, SECRET, {
        expiresIn: req.cookies?.remember ? "1 day" : "30m",
      }),
      {
        httpOnly: true,
        expires: addMilliseconds(
          Date.now(),
          req.cookies?.remember ? ONE_DAY : THIRTY_MINUTES
        ),
      }
    );
  }

  @Query(() => User, { nullable: true })
  async currentUser(@Ctx() { user }: IContext): Promise<User | undefined> {
    if (user) {
      return await dbAuth<User>(USERS_TABLE)
        .where({
          email: user.email,
          locked: false,
        })
        .first();
    }

    return undefined;
  }

  @Mutation(() => AuthResult)
  async login(
    @Ctx() { req, res }: IContext,
    @Args()
    { email, password: passwordInput }: LoginInput
  ): Promise<AuthResult> {
    let user = await dbAuth<User>(USERS_TABLE)
      .first()
      .where({
        email,
      });

    if (user) {
      if (user.locked) {
        return { error: LOCKED_USER };
      } else if (user.password === passwordInput) {
        AuthResolver.authenticate({
          req,
          res,
          email,
          admin: user.admin,
          type: user.type,
        });

        return { user };
      } else {
        if (user.tries >= 2) {
          const unlockKey = generate();
          await dbAuth<User>(USERS_TABLE)
            .where({ email })
            .update({
              locked: true,
              tries: 3,
              unlockKey,
            });

          sendMail({
            to: email,
            html: UnlockMail({
              email,
              unlockKey,
            }),
            subject: "Activación cuenta LALA TrAC",
          })
            .then(result => {
              console.log(
                `New locked user! ${email}`,
                JSON.stringify(result, null, 2)
              );
            })
            .catch(err => {
              console.error(
                `Error trying to send an email to new locked user! ${email}`,
                JSON.stringify(err, null, 2)
              );
            });
          return { error: LOCKED_USER };
        } else {
          await dbAuth<User>(USERS_TABLE).increment("tries", 1);
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
    let user = await dbAuth<User>(USERS_TABLE)
      .where({ email, unlockKey })
      .first();

    if (!user) {
      return { error: WRONG_INFO };
    } else {
      switch (user.password) {
        case passwordInput:
        case user.oldPassword1:
        case user.oldPassword2:
        case user.oldPassword3: {
          return {
            error: USED_OLD_PASSWORD,
          };
        }
        default: {
          user = (
            await dbAuth<User>(USERS_TABLE)
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
            AuthResolver.authenticate({
              req,
              res,
              email,
              admin: user.admin,
              type: user.type,
            });
            return { user };
          }
          return { error: WRONG_INFO };
        }
      }
    }
  }
}
