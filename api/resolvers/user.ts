import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { GraphQLJSONObject } from "graphql-type-json";
import { generate } from "randomstring";
import {
  Arg,
  Authorized,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { $PropertyType } from "utility-types";

import { defaultUserType } from "../../constants";
import { ArrayPropertyType } from "../../interfaces/utils";
import { ADMIN } from "../consts";
import { dbAuth } from "../db";
import {
  IUser,
  IUserPrograms,
  ProgramTable,
  USER_PROGRAMS_TABLE,
  UserProgramsTable,
  UserTable,
} from "../db/tables";
import {
  LockedUserResult,
  UpdateUserPrograms,
  UpsertedUser,
  User,
  UserProgram,
} from "../entities/user";
import { assertIsDefined } from "../utils";
import { sendMail, UnlockMail } from "../utils/mail";

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
        programs.map(program => ({
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
      };
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async upsertUsers(
    @Arg("users", () => [UpsertedUser])
    users: UpsertedUser[]
  ): Promise<User[]> {
    await Promise.all(
      users.map(
        async ({
          oldEmail,
          email,
          name,
          type,
          tries,
          rut_id,
          show_dropout,
          locked,
        }) => {
          /**
           * If there is an old email, we assume that we are
           * updating an existing user
           */
          if (oldEmail) {
            return UserTable()
              .update({
                email,
                name,
                type,
                tries,
                rut_id,
                show_dropout,
                locked,
              })
              .where({
                email: oldEmail,
              });
          } else {
            /**
             * Otherwise, we have to check if the email already exists
             * to decide if inserts or updates
             */
            const foundUser = await UserTable()
              .select("email")
              .where({ email })
              .first();

            if (foundUser) {
              return UserTable()
                .update({
                  name,
                  type,
                  tries,
                  rut_id,
                  show_dropout,
                  locked,
                })
                .where({ email });
            }

            return UserTable().insert({
              email,
              name,
              type,
              tries,
              rut_id,
              show_dropout,
              locked,
            });
          }
        }
      )
    );

    return (await UserTable().select("*")).map(({ type, ...rest }) => {
      return {
        ...rest,
        type: defaultUserType(type),
        programs: [],
      };
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => LockedUserResult)
  async lockMailUser(
    @Arg("email", () => EmailAddress) email: string
  ): Promise<LockedUserResult> {
    const user = await UserTable()
      .select("email")
      .where({ email })
      .first();

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
        html: UnlockMail({
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
        };
      }),
    };
  }

  @Authorized([ADMIN])
  @Mutation(() => [GraphQLJSONObject])
  async mailAllLockedUsers(): Promise<Record<string, any>> {
    const users = await UserTable()
      .select("email")
      .where({ locked: true });
    const mailResults: Record<string, any>[] = [];
    for (const { email } of users) {
      const unlockKey = generate();
      await UserTable()
        .update({ unlockKey })
        .where({ email });

      const result = await sendMail({
        to: email,
        html: UnlockMail({
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
    await UserTable()
      .delete()
      .where({ email });

    return (await UserTable().select("*")).map(({ type, ...rest }) => {
      return {
        ...rest,
        type: defaultUserType(type),
        programs: [],
      };
    });
  }

  @FieldResolver()
  async programs(
    @Root()
    { email }: Pick<User, "email">
  ): Promise<Pick<ArrayPropertyType<User, "programs">, "id">[]> {
    return (
      await UserProgramsTable()
        .select("program")
        .where({ email })
    ).map(({ program }) => {
      return { id: parseInt(program) };
    });
  }
}
