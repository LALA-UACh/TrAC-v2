import { GraphQLJSONObject } from "graphql-type-json";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { IContext } from "../../../interfaces";
import { PersistenceTable } from "../../db/tables";
import { Persistence } from "../../entities/auth/persistence";
import { assertIsDefined } from "../../utils/assert";

@Resolver(() => Persistence)
export class PersistenceResolver {
  @Authorized()
  @Query(() => Persistence, { nullable: true })
  async getPersistenceValue(
    @Ctx() { user }: IContext,
    @Arg("key") key: string
  ): Promise<Persistence | undefined> {
    assertIsDefined(user, "User context is not working properly");

    const persistenceValue = await PersistenceTable()
      .select("*")
      .where({
        user: user.email,
        key,
      })
      .first();

    return persistenceValue;
  }

  @Authorized()
  @Mutation(() => Persistence)
  async setPersistenceValue(
    @Ctx() { user }: IContext,
    @Arg("key") key: string,
    @Arg("data", () => GraphQLJSONObject) data: Record<string, any>
  ): Promise<Persistence> {
    assertIsDefined(user, "User context is not working properly");

    const existsValue = await PersistenceTable()
      .select("key")
      .where({
        user: user.email,
        key,
      })
      .first();

    let persistenceValue = {
      user: user.email,
      key,
      data,
    };
    try {
      if (existsValue) {
        await PersistenceTable()
          .update({
            data,
          })
          .where({
            user: user.email,
            key,
          });
      } else {
        await PersistenceTable().insert({
          user: user.email,
          key,
          data,
        });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }

    assertIsDefined(
      persistenceValue,
      "Error on persistence creation! " +
        user +
        " " +
        key +
        " " +
        JSON.stringify(data)
    );

    return persistenceValue;
  }
}
