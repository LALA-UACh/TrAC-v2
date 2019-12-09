import { toInteger, toNumber } from "lodash";
import { FieldResolver, Resolver, Root } from "type-graphql";
import { $PropertyType } from "utility-types";

import {
  CourseStatsTable,
  CourseTable,
  ProgramStructureTable,
} from "../db/tables";
import { Course } from "../entities/course";
import { assertIsDefined } from "../utils";

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

export type PartialCourse = Pick<Course, "id" | "code">;

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

    const nameData = await CourseTable()
      .select("name")
      .where({ id: code })
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

    const flowData = (
      await ProgramStructureTable()
        .select("id", "course_id", "requisites")
        .whereIn(
          "curriculum",
          ProgramStructureTable()
            .select("curriculum")
            .where({ id })
        )
    ).map(({ course_id, ...rest }) => ({ ...rest, code: course_id }));

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

    return (
      await ProgramStructureTable()
        .select("id", "course_id")
        .whereIn("course_id", requisitesRaw.requisites?.split(",") ?? [])
    ).map(({ id, course_id }) => ({
      id,
      code: course_id,
    }));
  }

  @FieldResolver()
  async historicalDistribution(
    @Root() { code }: PartialCourse
  ): Promise<$PropertyType<Course, "historicalDistribution">> {
    assertIsDefined(
      code,
      "The code needs to be available for the course fields resolvers"
    );

    const histogramData = await CourseStatsTable()
      .select("histogram", "histogram_labels", "color_bands")
      .where({
        course_taken: code,
      });

    const reducedHistogramData = histogramData.reduce<
      Record<number, { label: string; value: number; color: string }>
    >((acum, { histogram, histogram_labels, color_bands }, key) => {
      const histogramValues = histogram.split(",").map(toInteger);
      const histogramLabels = key === 0 ? histogram_labels.split(",") : [];
      const histogramColors =
        key === 0
          ? color_bands.split(";").map(value => {
              const [min, max, color] = value.split(",");
              return {
                min: toNumber(min),
                max: toNumber(max),
                color,
              };
            })
          : [];
      for (let i = 0; i < histogramValues.length; i++) {
        acum[i] = {
          label: acum[i]?.label ?? histogramLabels[i],
          value: (acum[i]?.value ?? 0) + (histogramValues[i] ?? 0),
          color:
            acum[i]?.color ??
            histogramColors.find(({ min, max }) => {
              return histogramValues[i] >= min && histogramValues[i] <= max;
            })?.color ??
            "#000000",
        };
      }
      return acum;
    }, {});

    return Object.values(reducedHistogramData);
  }
}
