import { Arg, FieldResolver, Int, Query, Resolver, Root } from "type-graphql";
import { $PropertyType } from "utility-types";

import { dbLALA } from "@db";
import { Course } from "@entities/course";
import { Program } from "@entities/program";

@Resolver(() => Program)
export class ProgramResolver {
  @Query(() => Program, { nullable: true })
  async program(
    @Arg("id", () => Int) id: number
  ): Promise<Pick<Program, "id" | "name" | "desc" | "state"> | undefined> {
    return await dbLALA<{
      id: number;
      name: string;
      desc: string;
      state: string;
    }>("program")
      .select("id", "name", "desc", "state")
      .where({ id })
      .first();
  }

  @FieldResolver()
  async name(
    @Root() { name, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "name">> {
    return (
      name ??
      (
        await dbLALA<{ name: string }>("program")
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
        await dbLALA<{ desc: string }>("program")
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
        await dbLALA<{ state: string }>("program")
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
      Course,
      "semester" | "code" | "credits" | "requisitesRaw" | "mention"
    >[]
  > {
    const data = await dbLALA<{
      semester: number;
      code: string;
      credits: number;
      requisites: string;
      mention: string;
    }>("program_structure")
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
        await dbLALA<{ name: string }>("course")
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
  async flow(): Promise<Course[]> {
    // TODO Courses flow resolver
    return [];
  }

  @FieldResolver()
  async requisites(): Promise<Course[]> {
    // TODO Courses requisites resolver
    return [];
  }

  @FieldResolver()
  async historicalDistribution(): Promise<unknown[]> {
    // TODO Courses historical distribution resolver
    return [];
  }
}
