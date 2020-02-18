import { Args, Authorized, Ctx, Mutation, Resolver } from "type-graphql";

import { UserType } from "../../constants";
import { IContext } from "../../interfaces";
import { TrackingTable } from "../db/tables";
import { Track, TrackInput } from "../entities/track";
import { anonService } from "../utils/anonymization";

@Resolver(() => Track)
export class TrackResolver {
  @Authorized()
  @Mutation(() => Boolean, { complexity: 0 })
  async track(
    @Args() { datetime_client, data }: TrackInput,
    @Ctx() { user }: IContext
  ) {
    const pattern = /(.*student=)(?<student_id>.*)(,showing-progress=.*)/;
    const match = data.match(pattern);
    const student_id = match?.groups?.student_id;

    if (student_id && student_id !== "null") {
      const anonymousId = await anonService.getAnonymousIdOrGetItBack(
        student_id
      );
      data = data.replace(pattern, (_fullMatch, p1, _student_id, p3) => {
        return [p1, anonymousId, p3].join("");
      });
    }

    TrackingTable()
      .insert({
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
