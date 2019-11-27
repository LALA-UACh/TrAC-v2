import {
  Arg,
  Authorized,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { $PropertyType } from "utility-types";

import { defaultStateCourse, defaultTermType } from "../../constants";
import {
  CourseTable,
  StudentCourseTable,
  StudentDropoutTable,
  StudentProgramTable,
  StudentTermTable,
} from "../db/tables";
import { Dropout } from "../entities/dropout";
import { Program } from "../entities/program";
import { Student } from "../entities/student";
import { TakenCourse } from "../entities/takenCourse";
import { Term } from "../entities/term";
import { assertIsDefined } from "../utils";

type PartialTakenCourse = Pick<TakenCourse, "id" | "code">;
type PartialTerm = Pick<Term, "id">;
type PartialStudent = Pick<
  Student,
  "id" | "curriculum" | "start_year" | "mention"
> & { program: Pick<Program, "id"> };
@Resolver(() => Student)
export class StudentResolver {
  @Authorized()
  @Query(() => Student, {
    nullable: true,
  })
  async student(
    @Arg("student_id")
    student_id: string,
    @Arg("program_id", () => Int, {
      nullable: true,
    })
    program_id?: number
  ): Promise<PartialStudent | undefined> {
    const studentData = await StudentProgramTable()
      .select("student_id", "program_id", "curriculum", "start_year", "mention")
      .where({
        student_id,
        program_id,
      })
      .orderBy("start_year", "desc")
      .first();

    if (studentData) {
      return {
        id: studentData.student_id,
        program: {
          id: studentData.program_id,
        },
        curriculum: studentData.curriculum,
        start_year: studentData.start_year,
        mention: studentData.mention,
      };
    }

    return undefined;
  }

  @FieldResolver()
  async terms(@Root() { id }: PartialStudent): Promise<PartialTerm[]> {
    assertIsDefined(
      id,
      `student id need to be available for Student field resolvers`
    );

    return await StudentTermTable()
      .select("id")
      .where({ student_id: id });
  }

  @FieldResolver()
  async dropout(@Root() { id }: PartialStudent): Promise<Dropout | undefined> {
    assertIsDefined(
      id,
      `student id need to be available for Student field resolvers`
    );

    return await StudentDropoutTable()
      .select("*")
      .where({ student_id: id })
      .first();
  }
}

@Resolver(() => Term)
export class TermResolver {
  @FieldResolver()
  async student_id(
    @Root() { id }: PartialTerm
  ): Promise<$PropertyType<Term, "student_id">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    const studentData = await StudentTermTable()
      .select("student_id")
      .where({ id })
      .first();

    assertIsDefined(
      studentData,
      `student_id could not be found for ${id} term`
    );

    return studentData.student_id;
  }

  @FieldResolver()
  async year(
    @Root() { id }: PartialTerm
  ): Promise<$PropertyType<Term, "year">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    const yearData = await StudentTermTable()
      .select("year")
      .where({ id })
      .first();

    assertIsDefined(yearData, `year could not be found for ${id} term`);

    return yearData.year;
  }

  @FieldResolver()
  async term(
    @Root() { id }: PartialTerm
  ): Promise<$PropertyType<Term, "term">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    const termData = await StudentTermTable()
      .select("term")
      .where({ id })
      .first();

    assertIsDefined(termData, `term could not be found for ${id} term`);

    return defaultTermType(termData.term);
  }

  @FieldResolver()
  async situation(
    @Root() { id }: PartialTerm
  ): Promise<$PropertyType<Term, "situation">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    const situationData = await StudentTermTable()
      .select("situation")
      .where({ id })
      .first();

    assertIsDefined(
      situationData,
      `situation could not be found for ${id} term`
    );

    return situationData.situation;
  }

  @FieldResolver()
  async semestral_grade(
    @Root() { id }: PartialTerm
  ): Promise<$PropertyType<Term, "semestral_grade">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    const pspData = await StudentTermTable()
      .select("t_gpa")
      .where({ id })
      .first();

    assertIsDefined(
      pspData,
      `Semestral grade could not be found for ${id} term`
    );

    return pspData.t_gpa;
  }

  @FieldResolver()
  async cumulated_grade(
    @Root() { id }: PartialTerm
  ): Promise<$PropertyType<Term, "cumulated_grade">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    const pgaData = await StudentTermTable()
      .where({ id })
      .first();

    assertIsDefined(
      pgaData,
      `Cumulated grade could not be found for ${id} term`
    );

    return pgaData.c_gpa;
  }

  @FieldResolver()
  async program_grade(
    @Root() { id }: PartialTerm
  ): Promise<$PropertyType<Term, "program_grade">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    // TODO: ProgramPGA Resolver
    return 0;
  }

  @FieldResolver()
  async takenCourses(
    @Root()
    { id }: PartialTerm
  ): Promise<PartialTakenCourse[]> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    const studentTermData = await StudentTermTable()
      .select("student_id", "year", "term")
      .where({ id })
      .first();

    assertIsDefined(
      studentTermData,
      `Taken courses could not be found for ${id} term`
    );

    // TODO: Optimize in a single SQL query

    const takenCoursesData = await StudentCourseTable()
      .select("id", "course_taken")
      .where({
        year: studentTermData.year,
        term: studentTermData.term,
        student_id: studentTermData.student_id,
      });

    return takenCoursesData.map(({ id, course_taken }) => {
      return { id, code: course_taken };
    });
  }
}

@Resolver(() => TakenCourse)
export class TakenCourseResolver {
  @FieldResolver()
  async name(
    @Root()
    { code, ...rest }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "name">> {
    assertIsDefined(
      code,
      `id and code needs to be available for Taken Course field resolvers`
    );

    const nameData = await CourseTable()
      .select("name")
      .where({ code })
      .first();

    assertIsDefined(
      nameData,
      `Name could not be found for ${code} taken course`
    );

    return nameData.name;
  }

  @FieldResolver()
  async registration(
    @Root() { id }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "registration">> {
    assertIsDefined(
      id,
      `id and code needs to be available for Taken Course field resolvers`
    );

    const registrationData = await StudentCourseTable()
      .select("registration")
      .where({ id })
      .first();

    assertIsDefined(
      registrationData,
      `Registration could not be found for ${id} taken course`
    );

    return registrationData.registration;
  }

  @FieldResolver()
  async grade(
    @Root() { id }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "grade">> {
    assertIsDefined(
      id,
      `id and code needs to be available for Taken Course field resolvers`
    );

    const gradeData = await StudentCourseTable()
      .select("grade")
      .where({ id })
      .first();

    assertIsDefined(
      gradeData,
      `Grade could not be found for ${id} taken course`
    );

    return gradeData.grade;
  }

  @FieldResolver()
  async state(
    @Root() { id }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "state">> {
    assertIsDefined(
      id,
      `id and code needs to be available for Taken Course field resolvers`
    );

    const stateData = await StudentCourseTable()
      .select("state")
      .where({ id })
      .first();

    assertIsDefined(
      stateData,
      `State could not be found for ${id} taken course`
    );

    return defaultStateCourse(stateData.state);
  }

  @FieldResolver()
  async parallelGroup(@Root() { id }: PartialTakenCourse) {
    assertIsDefined(
      id,
      `id and code needs to be available for Taken Course field resolvers`
    );

    const parallelGroupData = await StudentCourseTable()
      .select("pgroup")
      .where({ id })
      .first();

    assertIsDefined(
      parallelGroupData,
      `Parallel group could not be found for ${id} taken course`
    );

    return parallelGroupData.pgroup;
  }

  @FieldResolver()
  async currentDistribution(
    @Root()
    { id, code }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "currentDistribution">[]> {
    assertIsDefined(
      id,
      `id and code needs to be available for Taken Course field resolvers`
    );
    // TODO Taken course current distribution resolver
    return [];
  }
}
