import { uniqBy } from "lodash";
import { FieldResolver, Resolver, Root } from "type-graphql";
import { $PropertyType } from "utility-types";

import { defaultTermType } from "../../constants";
import {
  ProgramTable,
  StudentCourseTable,
  StudentTermTable,
} from "../db/tables";
import { Term } from "../entities/term";
import { assertIsDefined } from "../utils/assert";
import { PartialTakenCourse } from "./takenCourse";

export type PartialTerm = Pick<Term, "id">;

@Resolver(() => Term)
export class TermResolver {
  @FieldResolver()
  async student_id(
    @Root()
    { id }: PartialTerm
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
    @Root()
    { id }: PartialTerm
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
    @Root()
    { id }: PartialTerm
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
    @Root()
    { id }: PartialTerm
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
    @Root()
    { id }: PartialTerm
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
    @Root()
    { id }: PartialTerm
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
    @Root()
    { id }: PartialTerm
  ): Promise<$PropertyType<Term, "program_grade">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);

    const programPGAData = await ProgramTable()
      .select("last_gpa")
      .where(
        "id",
        StudentTermTable()
          .select("program_id")
          .where({ id })
          .first()
      )
      .first();

    assertIsDefined(
      programPGAData,
      `Program grade could not be found for ${id} term`
    );

    return programPGAData.last_gpa;
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
      .select("id", "course_taken", "course_equiv", "elect_equiv")
      .where({
        year: studentTermData.year,
        term: studentTermData.term,
        student_id: studentTermData.student_id,
      })
      .orderBy([
        { column: "course_taken", order: "desc" },
        { column: "year", order: "desc" },
        { column: "term", order: "desc" },
        {
          column: "state",
          order: "asc",
        },
      ]);

    return uniqBy(takenCoursesData, ({ course_taken }) => course_taken).map(
      ({ id, course_taken, course_equiv, elect_equiv }) => {
        return { id, code: course_taken, equiv: course_equiv || elect_equiv };
      }
    );
  }
}
