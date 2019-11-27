import { ArgsType, Field, ObjectType } from "type-graphql";

import { ITrack } from "../db/tables";

@ObjectType()
export class Track implements ITrack {
  @Field()
  id: number;

  @Field()
  app_id: string;

  @Field()
  user_id: string;

  @Field()
  datetime: Date;

  @Field()
  datetime_client: Date;

  @Field()
  data: string;
}

@ArgsType()
export class TrackInput implements Partial<Track> {
  @Field()
  datetime_client: Date;

  @Field()
  data: string;
}
