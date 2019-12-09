import { defaultsDeep } from "lodash";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { $PropertyType } from "utility-types";

import { IContext } from "../../interfaces";
import { IfImplements } from "../../interfaces/utils";
import { ADMIN } from "../consts";
import {
  ProgramStructureTable,
  ProgramTable,
  UserProgramsTable,
} from "../db/tables";
import { Program } from "../entities/program";
import { assertIsDefined } from "../utils";
import { PartialCourse } from "./course";

export type PartialProgram = Pick<Program, "id">;

@Resolver(() => Program)
export class ProgramResolver {
  @Authorized()
  @Query(() => Program, {
    nullable: true,
  })
  async program(
    @Arg("id") id: string,
    @Ctx() { user }: IContext
  ): Promise<Pick<Program, "id" | "name" | "desc" | "active"> | undefined> {
    assertIsDefined(user, `Authorization in context is broken`);

    if (
      (await UserProgramsTable()
        .select("program")
        .where({
          program: id,
          email: user.email,
        })
        .first()) === undefined
    ) {
      throw new Error("You are not allowed to request this program!");
    }

    return await ProgramTable()
      .select("id", "name", "desc", "active")
      .where({ id })
      .first();
  }

  @Authorized([ADMIN])
  @Query(() => [Program])
  async programs() {
    return await ProgramTable().select("id");
  }

  @Authorized()
  @Query(() => [Program])
  async myPrograms(@Ctx() { user }: IContext): Promise<Pick<Program, "id">[]> {
    assertIsDefined(user, `Authorization in context is broken`);

    return (
      await UserProgramsTable()
        .select("program")
        .where({
          email: user.email,
        })
    ).map(({ program }) => ({
      id: program,
    }));
  }

  @FieldResolver()
  async name(
    @Root()
    { name, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "name">> {
    if (name) {
      return name;
    }

    assertIsDefined(
      id,
      "The id needs to be available for the program fields resolvers"
    );

    const nameData = await ProgramTable()
      .select("name")
      .where({ id })
      .first();

    assertIsDefined(nameData, `Name could not be found for program ${name}`);

    return nameData.name;
  }

  @FieldResolver()
  async desc(
    @Root()
    { desc, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "desc">> {
    if (desc) {
      return desc;
    }
    assertIsDefined(
      id,
      "The id needs to be available for the program fields resolvers"
    );

    const descData = await ProgramTable()
      .select("desc")
      .where({ id })
      .first();

    assertIsDefined(
      descData,
      `Description could not be found for program ${id}`
    );

    return descData.desc;
  }

  @FieldResolver()
  async active(
    @Root()
    { active, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "active">> {
    if (active) {
      return active;
    }
    assertIsDefined(
      id,
      "The id needs to be available for the program fields resolvers"
    );

    const activeData = await ProgramTable()
      .select("active")
      .where({ id })
      .first();

    assertIsDefined(activeData, `State could not be found for program ${id}`);

    return activeData.active;
  }

  @FieldResolver()
  async lastGPA(
    @Root()
    { lastGPA, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "lastGPA">> {
    if (lastGPA) {
      return lastGPA;
    }
    assertIsDefined(
      id,
      "The id needs to be available for the program fields resolvers"
    );

    const last_gpa_data = await ProgramTable()
      .select("last_gpa")
      .where({ id })
      .first();

    assertIsDefined(
      last_gpa_data,
      `State could not be found for program ${id}`
    );

    return last_gpa_data.last_gpa;
  }

  @FieldResolver()
  async curriculums(
    @Root() { id: program_id }: Pick<Program, "id">
  ): Promise<
    IfImplements<
      {
        id: string;
        semesters: {
          id: number;
          courses: PartialCourse[];
        }[];
      }[],
      $PropertyType<Program, "curriculums">
    >
  > {
    assertIsDefined(
      program_id,
      "The id needs to be available for the program fields resolvers"
    );

    const data = await ProgramStructureTable()
      .select("id", "curriculum", "semester", "course_id")
      .where({ program_id });

    const curriculums = data.reduce<
      Record<
        string /*Curriculum id (program_structure => curriculum)*/,
        {
          id: string /*Curriculum id (program_structure => curriculum)*/;
          semesters: Record<
            number /*Semester id (program_structure => semester) (1-12)*/,
            {
              id: number /*Semester id (program_structure => semester)*/;
              courses: {
                id: number /* Course-semester-curriculum id (program_structure => id) */;
                code: string /* Course id (program_structure => course_id) */;
              }[];
            }
          >;
        }
      >
    >((acum, { curriculum, semester, course_id, id }) => {
      defaultsDeep(acum, {
        [curriculum]: {
          id: curriculum,
          semesters: {
            [semester]: {
              id: semester,
              courses: [],
            },
          },
        },
      });

      acum[curriculum].semesters[semester].courses.push({
        id,
        code: course_id,
      });
      return acum;
    }, {});

    return Object.values(curriculums).map(({ id, semesters }) => {
      return {
        id,
        semesters: Object.values(semesters).map(({ id, courses }) => {
          return {
            id,
            courses,
          };
        }),
      };
    });
  }
}
