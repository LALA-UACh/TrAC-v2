import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class Track {
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

@InputType()
export class TrackInput implements Partial<Track> {
  @Field()
  app_id: string;

  @Field()
  datetime_client: Date;

  @Field()
  data: string;
}
