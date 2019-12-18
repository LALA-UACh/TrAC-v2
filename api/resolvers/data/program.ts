import { defaultsDeep, intersectionWith } from "lodash";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { $PropertyType } from "utility-types";

import {
  defaultUserType,
  PROGRAM_NOT_FOUND,
  PROGRAM_UNAUTHORIZED,
  STUDENT_NOT_FOUND,
  UserType,
} from "../../../constants";
import { IContext } from "../../../interfaces";
import { ArrayPropertyType, IfImplements } from "../../../interfaces/utils";
import { ADMIN } from "../../api_constants";
import {
  ProgramStructureTable,
  ProgramTable,
  StudentProgramTable,
  StudentTable,
  UserProgramsTable,
} from "../../db/tables";
import { Program } from "../../entities/data/program";
import { anonService } from "../../utils/anonymization";
import { assertIsDefined } from "../../utils/assert";
import { PartialCourse } from "./course";

export type PartialProgram = Pick<Program, "id">;

@Resolver(() => Program)
export class ProgramResolver {
  @Authorized()
  @Mutation(() => Program)
  async program(
    @Ctx() { user }: IContext,
    @Arg("id", { nullable: true }) id?: string,
    @Arg("student_id", { nullable: true }) student_id?: string
  ): Promise<
    Pick<Program, "id"> & {
      curriculums?: Pick<ArrayPropertyType<Program, "curriculums">, "id">[];
    }
  > {
    assertIsDefined(user, `Authorization in context is broken`);

    if (defaultUserType(user.type) === UserType.Student) {
      student_id = await anonService.getAnonymousIdOrGetItBack(user.student_id);

      const studentProgram = await StudentProgramTable()
        .distinct("program_id", "curriculum", "start_year")
        .where({
          student_id,
        })
        .orderBy("start_year", "desc");

      assertIsDefined(studentProgram[0], STUDENT_NOT_FOUND);

      id = studentProgram[0].program_id;
      const curriculums = studentProgram.map(({ curriculum }) => {
        return {
          id: curriculum,
        };
      });
      return {
        id,
        curriculums,
      };
    } else {
      assertIsDefined(id, PROGRAM_NOT_FOUND);

      assertIsDefined(
        await UserProgramsTable()
          .select("program")
          .where({
            program: id,
            email: user.email,
          })
          .first(),
        PROGRAM_UNAUTHORIZED
      );

      if (student_id) {
        student_id = await anonService.getAnonymousIdOrGetItBack(student_id);

        const [programData, curriculums] = await Promise.all([
          ProgramTable()
            .select("id", "name", "desc", "active")
            .where({
              id,
            })
            .whereIn(
              "id",
              StudentProgramTable()
                .distinct("program_id")
                .where({
                  student_id,
                })
            )
            .first(),
          StudentProgramTable()
            .distinct("curriculum", "start_year")
            .where({
              student_id,
            })
            .orderBy("start_year", "desc"),
        ]);

        assertIsDefined(programData, STUDENT_NOT_FOUND);

        return {
          ...programData,
          curriculums:
            curriculums?.map(({ curriculum }) => ({
              id: curriculum,
            })) ?? [],
        };
      } else {
        const programData = await ProgramTable()
          .select("id", "name", "desc", "active")
          .where({ id })
          .first();

        assertIsDefined(programData, PROGRAM_NOT_FOUND);

        return programData;
      }
    }
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

    const [userPrograms, allPrograms] = await Promise.all([
      UserProgramsTable()
        .select("program")
        .where({
          email: user.email,
        }),
      ProgramTable().select("id"),
    ]);

    return intersectionWith(
      userPrograms,
      allPrograms,
      (userProgram, program) => {
        return userProgram.program === program.id;
      }
    ).map(({ program }) => {
      return {
        id: program,
      };
    });
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
    @Root()
    {
      id: program_id,
      curriculums: curriculumsIds,
    }: Pick<Program, "id" | "curriculums">
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

    const data = curriculumsIds
      ? await ProgramStructureTable()
          .select("id", "curriculum", "semester", "course_id")
          .where({ program_id })
          .whereIn(
            "curriculum",
            curriculumsIds.map(({ id }) => id)
          )
      : await ProgramStructureTable()
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
