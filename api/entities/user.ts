import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { GraphQLJSONObject } from "graphql-type-json";
import {
  Authorized,
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";

import { UserType } from "@constants";
import { ADMIN } from "@consts";

import { Program } from "./program";

registerEnumType(UserType, {
  name: "UserType",
  description: "Possible options of an user type",
});

@ObjectType()
export class User {
  @Field(() => EmailAddress)
  email: string;

  @Field()
  name: string;

  @Field()
  admin: boolean;

  @Field(() => UserType)
  type: UserType;

  @Field({ nullable: true })
  rut_id?: string;

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
  @Field(() => EmailAddress)
  email: string;

  @Field(() => Int)
  program: number;
}

@InputType()
export class UpsertedUser implements Partial<User> {
  @Field(() => EmailAddress, {
    nullable: true,
  })
  oldEmail?: string;

  @Field(() => EmailAddress)
  email: string;

  @Field({
    defaultValue: "default_name",
  })
  name: string;

  @Field(() => UserType, {
    defaultValue: UserType.Student,
  })
  type: UserType;

  @Field({ defaultValue: 0 })
  tries: number;

  @Field({ defaultValue: "" })
  rut_id: string;

  @Field({ defaultValue: false })
  show_dropout: boolean;

  @Field({ defaultValue: true })
  locked: boolean;
}

@InputType()
export class UpdateUserPrograms {
  @Field(() => EmailAddress)
  email: string;

  @Field(() => [Int])
  oldPrograms: number[];

  @Field(() => [Int])
  programs: number[];
}

@ObjectType()
export class LockedUserResult {
  @Field(() => GraphQLJSONObject)
  mailResult: Record<string, any>;

  @Field(() => [User])
  users: User[];
}

@ObjectType()
export class MultipleLockedUserResult {
  @Field(() => [GraphQLJSONObject])
  mailResults: Record<string, any>[];

  @Field(() => [User])
  users: User[];
}
