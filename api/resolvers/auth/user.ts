import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { GraphQLJSONObject } from "graphql-type-json";
import { generate } from "randomstring";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { defaultUserType } from "../../../constants";
import { baseUserConfig } from "../../../constants/userConfig";
import { ADMIN } from "../../constants";
import { dbAuth } from "../../db";
import {
  IUser,
  IUserPrograms,
  ProgramTable,
  USER_PROGRAMS_TABLE,
  UserConfigurationTable,
  UserProgramsTable,
  UserTable,
} from "../../db/tables";
import {
  LockedUserResult,
  UpdateUserPrograms,
  UpsertedUser,
  User,
  UserProgram,
} from "../../entities/auth/user";
import { sendMail, UnlockMail } from "../../services/mail";
import { assertIsDefined } from "../../utils/assert";

import type { $PropertyType } from "utility-types";

import type { IContext } from "../../../interfaces";
import type { ArrayPropertyType } from "../../../interfaces/utils";
export type PartialUser = Pick<User, "email"> & Partial<User>;
@Resolver(() => User)
export class UserResolver {
  @Authorized([ADMIN])
  @Query(() => [User])
  async users(): Promise<User[]> {
    return (await UserTable().select("*")).map(({ type, ...rest }) => {
      return {
        ...rest,
        type: defaultUserType(type),
        programs: [],
        config: baseUserConfig,
      };
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async updateUserPrograms(
    @Arg("userPrograms")
    { email, programs, oldPrograms }: UpdateUserPrograms
  ): Promise<User[]> {
    const trx = await dbAuth.transaction();
    try {
      await trx<IUserPrograms>(USER_PROGRAMS_TABLE)
        .delete()
        .whereIn("program", oldPrograms)
        .andWhere({
          email,
        });

      await trx<IUserPrograms>(USER_PROGRAMS_TABLE).insert(
        programs.map((program) => ({
          email,
          program: program.toString(),
        }))
      );
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }

    return (await UserTable().select("*")).map(({ type, ...rest }) => {
      return {
        ...rest,
        type: defaultUserType(type),
        programs: [],
        config: baseUserConfig,
      };
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async addUsersPrograms(
    @Arg("user_programs", () => [UserProgram])
    user_programs: UserProgram[]
  ): Promise<User[]> {
    const programsList = await ProgramTable()
      .whereIn(
        "id",
        user_programs.map(({ program }) => program)
      )
      .select("id");

    if (programsList.length > 0) {
      await dbAuth.raw(
        `${UserProgramsTable()
          .insert(
            user_programs
              .filter(({ program }) => {
                return programsList.find(
                  ({ id }) => program.toString() === id.toString()
                );
              })
              .map(({ email, program }) => {
                return {
                  email,
                  program: program.toString(),
                };
              })
          )
          .toString()} ON CONFLICT DO NOTHING`
      );
    }

    return (await UserTable().select("*")).map(({ type, ...rest }) => {
      return {
        ...rest,
        type: defaultUserType(type),
        programs: [],
        config: baseUserConfig,
      };
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async upsertUsers(
    @Ctx() { UserConfigDataLoader }: IContext,
    @Arg("users", () => [UpsertedUser])
    users: UpsertedUser[]
  ): Promise<User[]> {
    try {
      await Promise.all(
        users.map(
          async ({
            oldEmail,
            email,
            name,
            type,
            tries,
            student_id,
            locked,
            config,
          }) => {
            const configPromise = new Promise(async (resolve, reject) => {
              if (!config) {
                return resolve();
              }
              try {
                const userConfig = await UserConfigDataLoader.load(
                  oldEmail ?? email
                );
                if (!userConfig) {
                  await UserConfigurationTable().insert({
                    email,
                    config,
                  });
                } else {
                  await UserConfigurationTable()
                    .update({
                      email,
                      config,
                    })
                    .where({
                      email: oldEmail ?? email,
                    });
                }
                UserConfigDataLoader.clear(email).prime(email, {
                  email,
                  config,
                });
                resolve();
              } catch (err) {
                reject(err);
              }
            });
            const userPromise = new Promise(async (resolve, reject) => {
              try {
                const foundUser = await UserTable()
                  .select("email")
                  .where({
                    email: oldEmail ?? email,
                  })
                  .first();

                if (foundUser) {
                  await UserTable()
                    .update({
                      email,
                      name,
                      type,
                      tries,
                      student_id,
                      locked,
                    })
                    .where({
                      email: oldEmail ?? email,
                    });
                } else {
                  await UserTable().insert({
                    email,
                    name,
                    type,
                    tries,
                    student_id,
                    locked,
                  });
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            });

            await Promise.all([configPromise, userPromise]);
          }
        )
      );

      return (await UserTable().select("*")).map(({ type, ...rest }) => {
        return {
          ...rest,
          type: defaultUserType(type),
          programs: [],
          config: baseUserConfig,
        };
      });
    } catch (err) {
      throw err;
    }
  }

  @Authorized([ADMIN])
  @Mutation(() => LockedUserResult)
  async lockMailUser(
    @Arg("email", () => EmailAddress) email: string
  ): Promise<LockedUserResult> {
    const user = await UserTable().select("email").where({ email }).first();

    assertIsDefined(user, `User ${email} not found`);

    const unlockKey = generate();
    await UserTable()
      .update({
        locked: true,
        unlockKey,
      })
      .where({ email });
    const [mailResult, users] = await Promise.all<
      $PropertyType<LockedUserResult, "mailResult">,
      IUser[]
    >([
      sendMail({
        to: email,
        message: UnlockMail({
          email,
          unlockKey,
        }),
        subject: "Activación cuenta LALA TrAC",
      }),
      UserTable().select("*"),
    ]);

    return {
      mailResult,
      users: users.map(({ type, ...rest }) => {
        return {
          ...rest,
          type: defaultUserType(type),
          programs: [],
          config: baseUserConfig,
        };
      }),
    };
  }

  @Authorized([ADMIN])
  @Mutation(() => [GraphQLJSONObject])
  async mailAllLockedUsers(): Promise<Record<string, any>> {
    const users = await UserTable().select("email").where({ locked: true });
    const mailResults: Record<string, any>[] = [];
    for (const { email } of users) {
      const unlockKey = generate();
      await UserTable().update({ unlockKey }).where({ email });

      const result = await sendMail({
        to: email,
        message: UnlockMail({
          email,
          unlockKey,
        }),
        subject: "Activación cuenta LALA TrAC",
      });
      mailResults.push(result);
    }
    return mailResults;
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async deleteUser(
    @Arg("email", () => EmailAddress) email: string
  ): Promise<User[]> {
    await UserTable().delete().where({ email });

    return (await UserTable().select("*")).map(({ type, ...rest }) => {
      return {
        ...rest,
        type: defaultUserType(type),
        programs: [],
        config: baseUserConfig,
      };
    });
  }

  @FieldResolver()
  async name(
    @Ctx() { UserDataLoader }: IContext,
    @Root() { email, ...restUser }: PartialUser
  ) {
    return restUser.name ?? (await UserDataLoader.load(email))?.name;
  }

  @FieldResolver()
  async admin(
    @Root() { email, ...restUser }: PartialUser,
    @Ctx() { UserDataLoader }: IContext
  ) {
    return restUser.admin ?? (await UserDataLoader.load(email))?.admin;
  }

  @FieldResolver()
  async type(
    @Ctx() { UserDataLoader }: IContext,
    @Root() { email, ...restUser }: PartialUser
  ) {
    return defaultUserType(
      restUser.type ?? (await UserDataLoader.load(email))?.type
    );
  }

  @FieldResolver()
  async student_id(
    @Ctx() { UserDataLoader }: IContext,
    @Root() { email, ...restUser }: PartialUser
  ) {
    return (
      restUser.student_id ?? (await UserDataLoader.load(email))?.student_id
    );
  }

  @FieldResolver()
  async locked(
    @Ctx() { UserDataLoader }: IContext,
    @Root() { email, ...restUser }: PartialUser
  ) {
    return restUser.locked ?? (await UserDataLoader.load(email))?.locked;
  }

  @FieldResolver()
  async tries(
    @Ctx() { UserDataLoader }: IContext,
    @Root() { email, ...restUser }: PartialUser
  ) {
    return restUser.tries ?? (await UserDataLoader.load(email))?.tries;
  }

  @FieldResolver()
  async unlockKey(
    @Ctx() { UserDataLoader }: IContext,
    @Root() { email, ...restUser }: PartialUser
  ) {
    return restUser.unlockKey ?? (await UserDataLoader.load(email))?.unlockKey;
  }

  @FieldResolver()
  async programs(
    @Root()
    { email }: PartialUser
  ): Promise<Pick<ArrayPropertyType<User, "programs">, "id">[]> {
    return (await UserProgramsTable().select("program").where({ email })).map(
      ({ program }) => {
        return { id: program };
      }
    );
  }

  @FieldResolver()
  async config(
    @Ctx() { UserConfigDataLoader }: IContext,
    @Root() { email }: PartialUser
  ): Promise<Pick<User, "config">["config"]> {
    return {
      ...baseUserConfig,
      ...((await UserConfigDataLoader.load(email))?.config ?? {}),
    };
  }
}
