import { Args, Authorized, Ctx, Mutation, Resolver } from "type-graphql";

import { UserType } from "@constants";
import { TrackingTable } from "@db/tables";
import { Track, TrackInput } from "@entities/track";
import { IContext } from "@interfaces";

@Resolver(() => Track)
export class TrackResolver {
  @Authorized()
  @Mutation(() => Boolean)
  async track(
    @Args() { datetime_client, data }: TrackInput,
    @Ctx() { user }: IContext
  ) {
    TrackingTable.insert({
      app_id:
        user?.type === UserType.Director ? "TrAC-director" : "TrAC-student",
      user_id: user?.email,
      datetime: new Date(),
      datetime_client,
      data,
    })
      .then(() => {})
      .catch(err => {
        console.error(
          `Error on tracking insert! `,
          JSON.stringify(err, null, 2)
        );
      });
    return true;
  }
}
