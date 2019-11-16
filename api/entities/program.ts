import { Field, ID, ObjectType } from "type-graphql";

import { Course } from "./course";

@ObjectType()
export class Program {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  desc: string;

  @Field()
  state: string;

  @Field(() => [Course])
  semester: Course[];
}
