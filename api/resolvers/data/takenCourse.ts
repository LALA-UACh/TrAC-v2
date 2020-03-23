import { compact, toInteger, toNumber } from "lodash";
import { FieldResolver, Resolver, Root } from "type-graphql";
import { $PropertyType } from "utility-types";

import { defaultStateCourse } from "../../../constants";
import { CourseDataLoader } from "../../dataloaders/course";
import {
  CourseStatsByCourseTakenDataLoader,
  CourseStatsByStateDataLoader,
  StudentCourseDataLoader,
} from "../../dataloaders/takenCourse";
import { TakenCourse } from "../../entities/data/takenCourse";
import { assertIsDefined } from "../../utils/assert";
import { clearErrorArray } from "../../utils/clearErrorArray";

export type PartialTakenCourse = Pick<TakenCourse, "id" | "code" | "equiv">;

@Resolver(() => TakenCourse)
export class TakenCourseResolver {
  @FieldResolver()
  async name(
    @Root()
    { code }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "name">> {
    assertIsDefined(
      code,
      `code needs to be available for Taken Course field resolvers`
    );
    const nameData = await CourseDataLoader.load(code);

    if (nameData === undefined) {
      return code;
    }

    return nameData.name ?? nameData.id;
  }
  @FieldResolver()
  async registration(
    @Root()
    { id }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "registration">> {
    assertIsDefined(
      id,
      `id needs to be available for Taken Course field resolvers`
    );
    const registrationData = await StudentCourseDataLoader.load(id);
    assertIsDefined(
      registrationData,
      `Registration could not be found for ${id} taken course`
    );
    return registrationData.registration;
  }
  @FieldResolver()
  async grade(
    @Root()
    { id }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "grade">> {
    assertIsDefined(
      id,
      `id and code needs to be available for Taken Course field resolvers`
    );
    const gradeData = await StudentCourseDataLoader.load(id);
    assertIsDefined(
      gradeData,
      `Grade could not be found for ${id} taken course`
    );
    return gradeData.grade;
  }
  @FieldResolver()
  async state(
    @Root()
    { id }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "state">> {
    assertIsDefined(
      id,
      `id needs to be available for Taken Course field resolvers`
    );
    const stateData = await StudentCourseDataLoader.load(id);
    assertIsDefined(
      stateData,
      `State could not be found for ${id} taken course`
    );
    return defaultStateCourse(stateData.state);
  }
  @FieldResolver()
  async parallelGroup(
    @Root()
    { id }: PartialTakenCourse
  ) {
    assertIsDefined(
      id,
      `id needs to be available for Taken Course field resolvers`
    );
    const parallelGroupData = await StudentCourseDataLoader.load(id);
    assertIsDefined(
      parallelGroupData,
      `Parallel group could not be found for ${id} taken course`
    );
    return parallelGroupData.p_group;
  }
  @FieldResolver()
  async currentDistribution(
    @Root()
    { id, code }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "currentDistribution">> {
    assertIsDefined(
      id,
      `id needs to be available for Taken Course field resolvers`
    );
    assertIsDefined(
      code,
      `code needs to be available for Taken Course field resolvers`
    );

    const dataTakenCourse = await StudentCourseDataLoader.load(id);

    assertIsDefined(
      dataTakenCourse,
      `Data of the taken course ${id} ${code} could not be found!`
    );

    const histogramData = await CourseStatsByStateDataLoader.load({
      course_taken: code,
      year: dataTakenCourse.year,
      term: dataTakenCourse.term,
      p_group: dataTakenCourse.p_group,
    });

    if (histogramData === undefined) {
      return [];
    }

    assertIsDefined(
      histogramData,
      `Stats Data of the taken course ${id} ${code} could not be found!`
    );

    const histogramValues = histogramData.histogram.split(",").map(toInteger);
    const histogramLabels = histogramData.histogram_labels.split(",");

    return histogramValues.map((value, key) => {
      return {
        label: histogramLabels[key] ?? `${key}`,
        value,
      };
    });
  }

  @FieldResolver()
  async bandColors(
    @Root() { code, equiv }: PartialTakenCourse
  ): Promise<$PropertyType<TakenCourse, "bandColors">> {
    const bandColorsData = compact(
      clearErrorArray(
        await CourseStatsByCourseTakenDataLoader.loadMany(
          compact([equiv, code])
        )
      )
    )[0];

    if (bandColorsData === undefined) {
      return [];
    }

    const bandColors = bandColorsData.color_bands.split(";").map((value) => {
      const [min, max, color] = value.split(",");
      return {
        min: toNumber(min),
        max: toNumber(max),
        color,
      };
    });

    return bandColors;
  }
}
