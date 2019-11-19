import { Arg, Authorized, Ctx, FieldResolver, Int, Query, Resolver, Root } from "type-graphql";
import { $PropertyType } from "utility-types";

import {
    ADMIN, COURSE_TABLE, PROGRAM_STRUCTURE_TABLE, PROGRAM_TABLE, USER_PROGRAMS_TABLE
} from "@consts";
import { dbAuth, dbLALA } from "@db";
import { Course } from "@entities/course";
import { Program } from "@entities/program";
import { IContext } from "@interfaces";
import { ArrayPropertyType } from "@typings/utils";

@Resolver(() => Program)
export class ProgramResolver {
  @Authorized()
  @Query(() => Program, { nullable: true })
  async program(
    @Arg("id", () => Int) id: number,
    @Ctx() { user }: IContext
  ): Promise<Pick<Program, "id" | "name" | "desc" | "state"> | undefined> {
    if (
      user === undefined ||
      (await dbAuth<{ program: string }>(USER_PROGRAMS_TABLE)
        .select(PROGRAM_TABLE)
        .where({ program: id, email: user.email })
        .first()) === undefined
    ) {
      throw new Error("You are not allowed to request this program!");
    }

    return await dbLALA<{
      id: number;
      name: string;
      desc: string;
      state: string;
    }>(PROGRAM_TABLE)
      .select("id", "name", "desc", "state")
      .where({ id })
      .first();
  }

  @Authorized([ADMIN])
  @Query(() => [Program])
  async programs() {
    return await dbLALA<Program>(PROGRAM_TABLE).select("id");
  }

  @Authorized()
  @Query(() => [Program])
  async myPrograms(@Ctx() { user }: IContext): Promise<Pick<Program, "id">[]> {
    return (
      await dbAuth<{ program: string }>(USER_PROGRAMS_TABLE)
        .select(PROGRAM_TABLE)
        .where({ email: user?.email })
    ).map(({ program }) => ({
      id: parseInt(program, 10)
    }));
  }

  @FieldResolver()
  async name(
    @Root() { name, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "name">> {
    return (
      name ??
      (
        await dbLALA<{ name: string }>(PROGRAM_TABLE)
          .select("name")
          .where({ id })
          .first()
      )?.name ??
      (() => {
        throw new Error(`Name could not be found for program ${id}`);
      })()
    );
  }
  @FieldResolver()
  async desc(
    @Root() { desc, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "desc">> {
    return (
      desc ??
      (
        await dbLALA<{ desc: string }>(PROGRAM_TABLE)
          .select("desc")
          .where({ id })
          .first()
      )?.desc ??
      (() => {
        throw new Error(`Description could not be found for program ${id}`);
      })()
    );
  }
  @FieldResolver()
  async state(
    @Root() { state, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "state">> {
    return (
      state ??
      (
        await dbLALA<{ state: string }>(PROGRAM_TABLE)
          .select("state")
          .where({ id })
          .first()
      )?.state ??
      (() => {
        throw new Error(`State could not be found for program ${id}`);
      })()
    );
  }

  @FieldResolver()
  async courses(
    @Root() { id: program_id }: Pick<Program, "id">
  ): Promise<
    Pick<
      ArrayPropertyType<Program, "courses">,
      "semester" | "code" | "credits" | "requisitesRaw" | "mention"
    >[]
  > {
    const data = await dbLALA<{
      semester: number;
      code: string;
      credits: number;
      requisites: string;
      mention: string;
    }>(PROGRAM_STRUCTURE_TABLE)
      .select("semester", "code", "credits", "requisites", "mention")
      .distinct("curriculum")
      .where({ program_id });

    return data.map(({ semester, code, credits, requisites, mention }) => {
      if (semester && code && credits && requisites && mention) {
        return {
          semester,
          code,
          credits,
          requisitesRaw: requisites,
          mention
        };
      }
      throw new Error(
        "Unexpected null! " +
          JSON.stringify({ semester, code, credits, requisites, mention })
      );
    });
  }
}

@Resolver(() => Course)
export class CourseResolver {
  @FieldResolver()
  async name(
    @Root() { code }: Pick<Course, "code">
  ): Promise<$PropertyType<Course, "name">> {
    return (
      (
        await dbLALA<{ name: string }>(COURSE_TABLE)
          .select("name")
          .where({ code })
          .first()
      )?.name ??
      (() => {
        throw new Error(`Name not found for course ${code}`);
      })()
    );
  }

  @FieldResolver()
  async flow(): Promise<$PropertyType<Course, "flow">> {
    // TODO Courses flow resolver
    return [];
  }

  @FieldResolver()
  async requisites(): Promise<$PropertyType<Course, "requisites">> {
    // TODO Courses requisites resolver
    return [];
  }

  @FieldResolver()
  async historicalDistribution(): Promise<
    $PropertyType<Course, "historicalDistribution">[]
  > {
    // TODO Courses historical distribution resolver
    return [];
  }
}
