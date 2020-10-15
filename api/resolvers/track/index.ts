import { isValid } from "date-fns";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";

import { UserType } from "../../../client/constants";
import { ADMIN } from "../../constants";
import { TrackingTable } from "../../db/tables";
import { Track, TrackInput } from "../../entities/track";
import { anonService } from "../../services/anonymization";
import { assertIsValidDate } from "../../utils/assert";

import type { IContext } from "../../interfaces";
@Resolver(() => Track)
export class TrackResolver {
  @Authorized()
  @Mutation(() => Boolean)
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
        datetime_client: isValid(datetime_client)
          ? datetime_client
          : new Date(),
        datetime: new Date(),
        data,
      })
      .then(() => {})
      .catch((err) => {
        console.error(
          `Error on tracking insert! `,
          JSON.stringify(err, null, 2)
        );
      });
    return true;
  }

  @Authorized([ADMIN])
  @Query(() => [Track])
  trackInfo(@Arg("minDate") minDate: Date, @Arg("maxDate") maxDate: Date) {
    assertIsValidDate(minDate, "minDate");
    assertIsValidDate(maxDate, "maxDate");

    return TrackingTable()
      .select("*")
      .orderBy("datetime", "desc")
      .whereBetween("datetime", [minDate, maxDate]);
  }
}
