import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;

  @Field()
  oldPassword1: string;

  @Field()
  oldPassword2: string;

  @Field()
  oldPassword3: string;

  @Field()
  locked: boolean;

  @Field()
  tries: number;

  @Field()
  unlockKey: string;

  @Field()
  admin: boolean;

  @Field()
  type: string;

  @Field()
  id: string;

  @Field()
  show_dropout: boolean;
}
