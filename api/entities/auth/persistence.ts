import { GraphQLJSONObject } from "graphql-type-json";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Persistence {
  @Field()
  user: string;

  @Field()
  key: string;

  @Field(() => GraphQLJSONObject)
  data: Record<string, any>;

  @Field()
  timestamp: Date;
}
