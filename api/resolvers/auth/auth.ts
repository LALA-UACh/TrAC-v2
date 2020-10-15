import { addMilliseconds, addWeeks } from "date-fns";
import { sign } from "jsonwebtoken";
import { generate } from "randomstring";
import { Args, Ctx, Mutation, Query, Resolver } from "type-graphql";

import {
  defaultUserType,
  IS_DEVELOPMENT,
  IS_NOT_TEST,
  IS_PRODUCTION,
  LOCKED_USER,
  STUDENT_DATA_NOT_FOUND,
  USED_OLD_PASSWORD,
  UserType,
  WRONG_INFO,
} from "../../../client/constants";
import { baseUserConfig } from "../../../client/constants/userConfig";
import { ONE_DAY, SECRET, THIRTY_MINUTES } from "../../constants";
import { StudentDataLoader } from "../../dataloaders";
import { UserTable } from "../../db/tables";
import {
  AuthResult,
  LoginInput,
  UnlockCheck,
  UnlockInput,
} from "../../entities/auth/auth";
import { anonService } from "../../services/anonymization";
import { sendMail, UnlockMail } from "../../services/mail";

import type { IContext } from "../../interfaces";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { User } from "../../entities/auth/user";

export async function checkHasStudentData(user: Pick<User, "student_id">) {
  return Boolean(
    (
      await StudentDataLoader.load(
        await anonService.getAnonymousIdOrGetItBack(user.student_id)
      )
    )?.id
  );
}
@Resolver()
export class AuthResolver {
  static authenticate({
    req,
    res,
    email,
  }: {
    req: FastifyRequest;
    res: FastifyReply;
    email: string;
  }) {
    const token = sign({ email }, SECRET, {
      expiresIn: req.cookies?.remember ? "1 day" : "30m",
    });

    res.setCookie("authorization", token, {
      path: "/",
      httpOnly: true,
      secure: IS_PRODUCTION,
      expires: IS_DEVELOPMENT
        ? addWeeks(Date.now(), 12)
        : addMilliseconds(
            Date.now(),
            req.cookies?.remember ? ONE_DAY : THIRTY_MINUTES
          ),
      signed: true,
    });

    return token;
  }

  @Query(() => AuthResult, { nullable: true })
  async currentUser(@Ctx() { user, token }: IContext): Promise<AuthResult> {
    if (user) {
      if (defaultUserType(user.type) === UserType.Student) {
        if (!user.student_id) {
          return {};
        }

        if (!(await checkHasStudentData(user))) return {};
      }

      return {
        user: {
          ...user,
          type: defaultUserType(user.type),
          programs: [],
          config: baseUserConfig,
        },
        token,
      };
    }

    return {};
  }

  @Mutation(() => AuthResult)
  async login(
    @Ctx() { req, res }: IContext,
    @Args()
    { email, password: passwordInput }: LoginInput
  ): Promise<AuthResult> {
    let user = await UserTable().first().where({
      email,
    });

    if (user) {
      if (defaultUserType(user.type) === UserType.Student) {
        if (!user.student_id) {
          return {
            error: STUDENT_DATA_NOT_FOUND,
          };
        }

        if (!(await checkHasStudentData(user))) {
          return { error: STUDENT_DATA_NOT_FOUND };
        }
      }
      if (user.locked) {
        return { error: LOCKED_USER };
      } else if (user.password === passwordInput) {
        const type = defaultUserType(user.type);
        UserTable()
          .update({
            tries: 0,
          })
          .where({ email })
          .catch((err) => {
            console.error(JSON.stringify(err, null, 2));
          });
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
            config: baseUserConfig,
          },
          token,
        };
      } else {
        if (user.tries && user.tries >= 2) {
          const unlockKey = generate();
          await UserTable().where({ email }).update({
            locked: true,
            tries: 3,
            unlockKey,
          });

          await sendMail({
            to: email,
            message: UnlockMail({
              email,
              unlockKey,
            }),
            subject: "Activación cuenta LALA TrAC",
          })
            .then((result) => {
              if (IS_NOT_TEST) {
                console.log(
                  `New locked user! ${email}`,
                  JSON.stringify(result, null, 2)
                );
              }
            })
            .catch((err) => {
              if (IS_NOT_TEST) {
                console.error(
                  `Error trying to send an email to new locked user! ${email}`,
                  JSON.stringify(err, null, 2)
                );
              }
            });
          return { error: LOCKED_USER };
        } else {
          await UserTable().increment("tries", 1).where({ email });
        }
      }
    }
    return { error: WRONG_INFO };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { user, res }: IContext) {
    if (user) {
      res.clearCookie("authorization", {
        path: "/",
        httpOnly: true,
        secure: IS_PRODUCTION,
      });
      return true;
    }
    return false;
  }

  @Query(() => String, {
    nullable: true,
    description:
      "Check unlockKey combination, if it's valid, returns null, if it's invalid, returns an error message.",
  })
  async checkUnlockKey(
    @Args() { email, unlockKey }: UnlockCheck
  ): Promise<string | null> {
    const user = await UserTable()
      .where({ email, unlockKey })
      .select("email", "type", "student_id")
      .first();

    if (user) {
      if (defaultUserType(user.type) === UserType.Student) {
        if (!user.student_id) return STUDENT_DATA_NOT_FOUND;

        if (!(await checkHasStudentData(user))) {
          return STUDENT_DATA_NOT_FOUND;
        }
      }

      return null;
    }
    return WRONG_INFO;
  }

  @Mutation(() => AuthResult)
  async unlock(
    @Ctx() { req, res }: IContext,
    @Args()
    { email, password: passwordInput, unlockKey }: UnlockInput
  ): Promise<AuthResult> {
    let user = await UserTable().where({ email, unlockKey }).first();

    if (!user) {
      return { error: WRONG_INFO };
    } else {
      if (defaultUserType(user.type) === UserType.Student) {
        if (!user.student_id) {
          return {
            error: STUDENT_DATA_NOT_FOUND,
          };
        }
        if (!(await checkHasStudentData(user)))
          return { error: STUDENT_DATA_NOT_FOUND };
      }

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
                config: baseUserConfig,
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
