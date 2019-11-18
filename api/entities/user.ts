import { IsEmail } from "class-validator";
import { Authorized, Field, InputType, ObjectType, registerEnumType } from "type-graphql";

import { UserType } from "@constants";
import { ADMIN } from "@consts";

import { Program } from "./program";

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

  @Field({ nullable: true })
  id?: string;

  @Field()
  show_dropout: boolean;

  @Field(() => [Program])
  programs: Program[];

  password: string;

  oldPassword1: string;

  oldPassword2: string;

  oldPassword3: string;

  @Authorized([ADMIN])
  @Field()
  locked: boolean;

  @Authorized([ADMIN])
  @Field()
  tries: number;

  @Authorized([ADMIN])
  @Field()
  unlockKey: string;
}

@InputType()
export class UserProgram {
  @IsEmail()
  @Field()
  email: string;

  @Field()
  program: number;
}

@InputType()
export class UpsertedUser implements Partial<User> {
  @Field({ nullable: true })
  oldEmail?: string;

  @Field()
  email: string;

  @Field({ defaultValue: "default_name" })
  name: string;

  @Field(() => UserType, { defaultValue: UserType.Student })
  type: UserType;

  @Field({ defaultValue: 0 })
  tries: number;

  @Field({ defaultValue: "" })
  id: string;

  @Field({ defaultValue: false })
  show_dropout: boolean;

  @Field({ defaultValue: true })
  locked: boolean;
}
