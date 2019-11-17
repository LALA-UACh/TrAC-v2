import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  admin: boolean;

  @Field()
  type: string;

  @Field()
  show_dropout: boolean;

  password: string;

  oldPassword1: string;

  oldPassword2: string;

  oldPassword3: string;

  locked: boolean;

  tries: number;

  unlockKey: string;
}
