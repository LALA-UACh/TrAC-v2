import { FieldResolver, Resolver, Root } from "type-graphql";
import { $PropertyType } from "utility-types";

import { defaultTermType } from "../../../constants";
import {
  ProgramGradeDataLoader,
  TakenCoursesDataLoader,
  TermDataLoader,
} from "../../dataloaders/term";
import { Term } from "../../entities/data/term";
import { assertIsDefined } from "../../utils/assert";
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
    const studentData = await TermDataLoader.load(id);
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
    const yearData = await TermDataLoader.load(id);
    assertIsDefined(yearData, `year could not be found for ${id} term`);
    return yearData.year;
  }

  @FieldResolver()
  async term(
    @Root()
    { id }: PartialTerm
  ): Promise<$PropertyType<Term, "term">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);
    const termData = await TermDataLoader.load(id);

    assertIsDefined(termData, `term could not be found for ${id} term`);
    return defaultTermType(termData.term);
  }

  @FieldResolver()
  async comments(
    @Root()
    { id }: PartialTerm
  ): Promise<$PropertyType<Term, "comments">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);
    const termData = await TermDataLoader.load(id);
    assertIsDefined(termData, `comments could not be found for ${id} term`);
    return termData.comments;
  }

  @FieldResolver()
  async situation(
    @Root()
    { id }: PartialTerm
  ): Promise<$PropertyType<Term, "situation">> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);
    const situationData = await TermDataLoader.load(id);
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
    const pspData = await TermDataLoader.load(id);
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
    const pgaData = await TermDataLoader.load(id);
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

    const programPGA = await ProgramGradeDataLoader.load(id);

    assertIsDefined(
      programPGA,
      `Program grade could not be found for ${id} term`
    );

    return programPGA;
  }

  @FieldResolver()
  async takenCourses(
    @Root()
    { id }: PartialTerm
  ): Promise<PartialTakenCourse[]> {
    assertIsDefined(id, `id needs to be available for Terms field resolvers`);
    const studentTermData = await TermDataLoader.load(id);
    assertIsDefined(
      studentTermData,
      `Taken courses could not be found for ${id} term`
    );

    const takenCoursesData = await TakenCoursesDataLoader.load({
      year: studentTermData.year,
      term: studentTermData.term,
      student_id: studentTermData.student_id,
    });

    return takenCoursesData.map(
      ({ id, course_taken, course_equiv, elect_equiv }) => {
        return { id, code: course_taken, equiv: course_equiv || elect_equiv };
      }
    );
  }
}
