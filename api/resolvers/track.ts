import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";

import { TRACKING_TABLE } from "@consts";
import { dbTracking } from "@db";
import { Track, TrackInput } from "@entities/track";
import { IContext } from "@interfaces";

@Resolver(() => Track)
export class TrackResolver {
  @Authorized()
  @Mutation(() => Track)
  async track(
    @Arg("data") { app_id, datetime_client, data }: TrackInput,
    @Ctx() { user }: IContext
  ) {
    console.log("TRACK");
    await dbTracking<Track>(TRACKING_TABLE).insert({
      app_id,
      user_id: user?.email,
      datetime: new Date(),
      datetime_client,
      data,
    });
  }
}
