import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { GraphQLJSONObject } from "graphql-type-json";
import {
  Authorized,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";

import { UserType } from "../../../constants";
import { ADMIN } from "../../api_constants";
import { IUser } from "../../db/tables";
import { Program } from "../data/program";

registerEnumType(UserType, {
  name: "UserType",
  description: "Possible options of an user type",
});

@ObjectType()
export class User implements Partial<IUser> {
  @Field(() => EmailAddress)
  email: string;

  @Field()
  name: string;

  @Field()
  admin: boolean;

  @Field(() => UserType)
  type: UserType;

  @Field()
  student_id: string;

  @Field()
  show_dropout: boolean;

  @Field()
  show_student_list: boolean;

  @Authorized([ADMIN])
  @Field()
  locked: boolean;

  @Authorized([ADMIN])
  @Field()
  tries: number;

  @Authorized([ADMIN])
  @Field()
  unlockKey: string;

  @Field(() => [Program])
  programs: Program[];
}

@InputType()
export class UserProgram {
  @Field(() => EmailAddress)
  email: string;

  @Field(() => String)
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
  student_id: string;

  @Field({ defaultValue: false })
  show_dropout: boolean;

  @Field({ defaultValue: false })
  show_student_list: boolean;

  @Field({ defaultValue: true })
  locked: boolean;
}

@InputType()
export class UpdateUserPrograms {
  @Field(() => EmailAddress)
  email: string;

  @Field(() => [String])
  oldPrograms: string[];

  @Field(() => [String])
  programs: string[];
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
