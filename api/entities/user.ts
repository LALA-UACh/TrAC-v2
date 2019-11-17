import { Field, ObjectType, registerEnumType } from "type-graphql";

import { UserType } from "@constants";

registerEnumType(UserType, {
  name: "UserType",
  description: "Possible options of an user type"
});

@ObjectType()
export class User {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  admin: boolean;

  @Field(() => UserType)
  type: UserType;

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
