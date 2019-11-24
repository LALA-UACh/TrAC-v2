import { defaultsDeep } from "lodash";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { $PropertyType } from "utility-types";

import { ADMIN } from "@consts";
import {
  CourseTable,
  ProgramStructureTable,
  ProgramTable,
  UserProgramsTable,
} from "@db/tables";
import { Course } from "@entities/course";
import { Program } from "@entities/program";
import { IContext } from "@interfaces";
import { IfImplements } from "@typings/utils";
import { assertIsDefined } from "@utils";

const creditsFormat = ({
  credits,
  creditsSCT,
}: {
  credits?: number;
  creditsSCT?: number;
}) => {
  return [
    {
      label: "Credits",
      value: credits ?? 0,
    },
    {
      label: "SCT",
      value: creditsSCT ?? 0,
    },
  ];
};

type PartialCourse = Pick<Course, "id" | "code">;
@Resolver(() => Program)
export class ProgramResolver {
  @Authorized()
  @Query(() => Program, {
    nullable: true,
  })
  async program(
    @Arg("id", () => Int) id: number,
    @Ctx() { user }: IContext
  ): Promise<Pick<Program, "id" | "name" | "desc" | "state"> | undefined> {
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
      .select("id", "name", "desc", "state")
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
      id: parseInt(program, 10),
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
      `Description could not be found for program ${name}`
    );

    return descData.desc;
  }

  @FieldResolver()
  async state(
    @Root()
    { state, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "state">> {
    if (state) {
      return state;
    }
    assertIsDefined(
      id,
      "The id needs to be available for the program fields resolvers"
    );

    const stateData = await ProgramTable()
      .select("state")
      .where({ id })
      .first();

    assertIsDefined(stateData, `State could not be found for program ${name}`);

    return stateData.state;
  }

  @FieldResolver()
  async curriculums(
    @Root() { id }: Pick<Program, "id">
  ): Promise<
    IfImplements<
      {
        id: number;
        semesters: {
          id: number;
          courses: PartialCourse[];
        }[];
      }[],
      $PropertyType<Program, "curriculums">
    >
  > {
    assertIsDefined(
      id,
      "The id needs to be available for the program fields resolvers"
    );

    const data = await ProgramStructureTable()
      .select("id", "curriculum", "semester", "code")
      .where({ program_id: id });

    const curriculums = data.reduce<
      Record<
        number /*Curriculum id*/,
        {
          id: number /*Curriculum id*/;
          semesters: Record<
            number /*Semester id (1-12)*/,
            {
              id: number /*Semester id*/;
              courses: {
                id: number /* Course id (program_structure => id) */;
                code: string;
              }[];
            }
          >;
        }
      >
    >((acum, { curriculum, semester, code, id }) => {
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
        code,
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

/**
 * These resolvers assumes that they will always have access to:
 * "id" which comes from program_structure => id
 * "code" which comes from program_structure => code
 */
@Resolver(() => Course)
export class CourseResolver {
  @FieldResolver()
  async name(
    @Root()
    { code }: PartialCourse
  ): Promise<$PropertyType<Course, "name">> {
    assertIsDefined(
      code,
      "The id and code needs to be available for the course fields resolvers"
    );

    if (name) {
      return name;
    }

    const nameData = await CourseTable()
      .select("name")
      .where({ code })
      .first();

    assertIsDefined(nameData, `Name not found for course ${code}`);

    return nameData.name;
  }

  @FieldResolver()
  async credits(
    @Root() { id, code }: PartialCourse
  ): Promise<$PropertyType<Course, "credits">> {
    assertIsDefined(
      id,
      "The id and code needs to be available for the course fields resolvers"
    );

    const courseData = await ProgramStructureTable()
      .select("credits", "creditsSCT")
      .where({ id })
      .first();

    assertIsDefined(courseData, `Credits could not be found for ${code}`);

    return creditsFormat({
      credits: courseData?.credits,
      creditsSCT: courseData?.creditsSCT,
    });
  }

  @FieldResolver()
  async mention(
    @Root() { id, code }: PartialCourse
  ): Promise<$PropertyType<Course, "mention">> {
    assertIsDefined(
      id,
      "The id and code needs to be available for the course fields resolvers"
    );

    const courseData = await ProgramStructureTable()
      .select("mention")
      .where({ id })
      .first();

    assertIsDefined(courseData, `Mention could not be found for ${code}`);

    return courseData.mention;
  }

  @FieldResolver()
  async flow(@Root() { id, code }: PartialCourse): Promise<PartialCourse[]> {
    assertIsDefined(
      id,
      "The id and code needs to be available for the course fields resolvers"
    );

    const flowData = await ProgramStructureTable()
      .select("id", "code", "requisites")
      .whereIn(
        "curriculum",
        ProgramStructureTable()
          .select("curriculum")
          .where({ id })
      );
    return flowData.filter(({ requisites }) => {
      return requisites.includes(code);
    });
  }

  @FieldResolver()
  async requisites(
    @Root() { id, code }: PartialCourse
  ): Promise<PartialCourse[]> {
    assertIsDefined(
      id,
      "The id and code needs to be available for the course fields resolvers"
    );

    const requisitesRaw = await ProgramStructureTable()
      .select("requisites")
      .where({ id })
      .first();

    assertIsDefined(requisitesRaw, `Requisites could not be found for ${code}`);

    return await ProgramStructureTable()
      .select("id", "code")
      .whereIn("code", requisitesRaw.requisites?.split(",") ?? []);
  }

  @FieldResolver()
  async historicalDistribution(
    @Root() { id, code }: PartialCourse
  ): Promise<$PropertyType<Course, "historicalDistribution">[]> {
    assertIsDefined(
      code,
      "The id and code needs to be available for the course fields resolvers"
    );

    // TODO Courses historical distribution resolver
    return [];
  }
}
