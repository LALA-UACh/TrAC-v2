import { GraphQLJSONObject } from "graphql-type-json";
import {
  Arg,
  Authorized,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";

import { IContext } from "../../../interfaces";
import { ADMIN } from "../../constants";
import * as localDataLoaders from "../../dataloaders";
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

    const persistenceValue = {
      user: user.email,
      key,
      data,
      timestamp: new Date(),
    } as const;

    try {
      if (existsValue) {
        await PersistenceTable()
          .update({
            data: persistenceValue.data,
            timestamp: persistenceValue.timestamp,
          })
          .where({
            user: user.email,
            key,
          });
      } else {
        await PersistenceTable().insert(persistenceValue);
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

  @Authorized([ADMIN])
  @Query(() => [Persistence])
  async userPersistences(@Arg("user") user: string): Promise<Persistence[]> {
    return await PersistenceTable()
      .select("data", "key", "timestamp", "user")
      .where({
        user,
      });
  }

  @Authorized([ADMIN])
  @Mutation(() => Int)
  async resetPersistence(@Arg("user") user: string) {
    const n = await PersistenceTable()
      .update({
        data: {},
        timestamp: new Date(),
      })
      .where({
        user,
      });

    return n;
  }

  @Authorized([ADMIN])
  @Mutation(() => Int)
  async resetDataLoadersCache() {
    const dataLoaders = Object.values(localDataLoaders);
    dataLoaders.forEach((dataLoader) => {
      dataLoader.clearAll();
    });

    return dataLoaders.length;
  }
}
