import { GraphQLJSONObject } from "graphql-type-json";
import { generate } from "randomstring";
import { Arg, Authorized, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";

import { ADMIN, PROGRAM_TABLE, USER_PROGRAMS_TABLE, USERS_TABLE } from "@consts";
import { dbAuth, dbLALA } from "@db";
import { Program } from "@entities/program";
import { UpdateUserPrograms, UpsertedUser, User, UserProgram } from "@entities/user";
import { sendMail, UnlockMail } from "@utils/mail";

@Resolver(() => User)
export class UserResolver {
  @Authorized([ADMIN])
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await dbAuth<User>(USERS_TABLE)
      .select("*")
      .select("id as rut_id");
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async updateUserPrograms(
    @Arg("userPrograms")
    { email, programs, oldPrograms }: UpdateUserPrograms
  ) {
    const trx = await dbAuth.transaction();
    try {
      await trx(USER_PROGRAMS_TABLE)
        .delete()
        .whereIn("program", oldPrograms)
        .andWhere({
          email
        });

      await trx(USER_PROGRAMS_TABLE).insert(
        programs.map(program => ({ email, program }))
      );
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }

    return await dbAuth<User>(USERS_TABLE)
      .select("*")
      .select("id as rut_id");
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async addUsersPrograms(
    @Arg("user_programs", () => [UserProgram]) user_programs: UserProgram[]
  ) {
    const filteredPrograms = await dbLALA<{ id: string }>(PROGRAM_TABLE)
      .whereIn(
        "id",
        user_programs.map(({ program }) => program)
      )
      .select("id");

    if (filteredPrograms.length > 0) {
      await dbAuth.raw(
        `${dbAuth(USER_PROGRAMS_TABLE)
          .insert(
            user_programs.filter(({ program }) =>
              filteredPrograms.find(({ id }) => program.toString(10) === id)
            )
          )
          .toString()} ON CONFLICT DO NOTHING`
      );
    }
    "".replace(/^update\s.*\sset\s/i, "");

    return await dbAuth(USERS_TABLE)
      .select("*")
      .select("id as rut_id");
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async upsertUsers(@Arg("users", () => [UpsertedUser]) users: UpsertedUser[]) {
    await Promise.all(
      users.map(
        async ({
          oldEmail,
          email,
          name,
          type,
          tries,
          rut_id: id,
          show_dropout,
          locked
        }) => {
          /**
           * If there is an old email, we assume that we are
           * updating an existing user
           */
          if (oldEmail) {
            return dbAuth(USERS_TABLE)
              .update({ email, name, type, tries, id, show_dropout, locked })
              .where({ email: oldEmail });
          } else {
            /**
             * Otherwise, it's just inserting new data
             */
            return dbAuth(USERS_TABLE).insert({
              email,
              name,
              type,
              tries,
              id,
              show_dropout,
              locked
            });
          }
        }
      )
    );

    return await dbAuth(USERS_TABLE)
      .select("*")
      .select("id as rut_id");
  }

  @Authorized([ADMIN])
  @Mutation(() => GraphQLJSONObject)
  async lockMailUser(@Arg("email") email: string) {
    const user = await dbAuth<Pick<User, "email">>(USERS_TABLE)
      .select("email")
      .where({ email })
      .first();

    if (user) {
      const unlockKey = generate();
      await dbAuth<User>(USERS_TABLE).update({
        locked: true,
        unlockKey
      });
      return await sendMail({
        to: email,
        html: UnlockMail({ email, unlockKey }),
        subject: "Activación cuenta LALA TrAC"
      });
    }

    throw new Error(`User ${email} not found!`);
  }

  @Authorized([ADMIN])
  @Mutation(() => [GraphQLJSONObject])
  async mailAllLockedUsers() {
    const users = await dbAuth<Pick<User, "email">>(USERS_TABLE)
      .select("email")
      .where({ locked: true });
    const results: object[] = [];
    for (const { email } of users) {
      const unlockKey = generate();
      await dbAuth<User>(USERS_TABLE)
        .update({ unlockKey })
        .where({ email });

      const result = await sendMail({
        to: email,
        html: UnlockMail({ email, unlockKey }),
        subject: "Activación cuenta LALA TrAC"
      });
      results.push(result);
    }
    return results;
  }

  @FieldResolver()
  async programs(
    @Root() { email }: Pick<User, "email">
  ): Promise<Pick<Program, "id">[]> {
    return await dbAuth<{ id: string }>(USER_PROGRAMS_TABLE)
      .select("program as id")
      .where({ email });
  }
}
