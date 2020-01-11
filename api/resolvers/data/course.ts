import { compact, toInteger, toNumber } from "lodash";
import { FieldResolver, Resolver, Root } from "type-graphql";
import { $PropertyType } from "utility-types";

import { baseConfig } from "../../../constants/baseConfig";
import {
  CourseDataLoader,
  CourseFlowDataLoader,
  CourseRequisitesLoader,
  CourseStatsDataLoader,
} from "../../dataloaders/course";
import { Course } from "../../entities/data/course";
import { assertIsDefined } from "../../utils/assert";

const creditsFormat = ({
  credits,
  creditsSCT,
}: {
  credits?: number;
  creditsSCT?: number;
}) => {
  return [
    {
      label: baseConfig.CREDITS_LABEL,
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
    { id, code }: PartialCourse
  ): Promise<$PropertyType<Course, "name">> {
    return (await CourseDataLoader.load({ id, code }))?.courseTable?.name ?? "";
  }

  @FieldResolver()
  async credits(
    @Root() { id, code }: PartialCourse
  ): Promise<$PropertyType<Course, "credits">> {
    const courseData = (
      await CourseDataLoader.load({
        id,
        code,
      })
    )?.programStructureTable;

    return creditsFormat({
      credits: courseData?.credits,
      creditsSCT: courseData?.credits_sct,
    });
  }

  @FieldResolver()
  async mention(
    @Root() { id, code }: PartialCourse
  ): Promise<$PropertyType<Course, "mention">> {
    return (
      (
        await CourseDataLoader.load({
          id,
          code,
        })
      )?.programStructureTable?.mention ?? ""
    );
  }

  @FieldResolver()
  async flow(@Root() { id, code }: PartialCourse): Promise<PartialCourse[]> {
    return compact(await CourseFlowDataLoader.load({ id, code }));
  }

  @FieldResolver()
  async requisites(@Root() { id }: PartialCourse): Promise<PartialCourse[]> {
    assertIsDefined(
      id,
      "The id and code needs to be available for the course fields resolvers"
    );

    return compact(await CourseRequisitesLoader.load(id));
  }

  @FieldResolver()
  async historicalDistribution(
    @Root() { code }: PartialCourse
  ): Promise<$PropertyType<Course, "historicalDistribution">> {
    const histogramData = await CourseStatsDataLoader.load(code);

    const reducedHistogramData =
      histogramData?.reduce<Record<number, { label: string; value: number }>>(
        (acum, { histogram, histogram_labels }, key) => {
          const histogramValues = histogram.split(",").map(toInteger);
          const histogramLabels = key === 0 ? histogram_labels.split(",") : [];

          for (let i = 0; i < histogramValues.length; i++) {
            acum[i] = {
              label: acum[i]?.label ?? histogramLabels[i],
              value: (acum[i]?.value ?? 0) + (histogramValues[i] ?? 0),
            };
          }
          return acum;
        },
        {}
      ) ?? {};

    return Object.values(reducedHistogramData);
  }

  @FieldResolver()
  async bandColors(
    @Root() { code }: PartialCourse
  ): Promise<$PropertyType<Course, "bandColors">> {
    const bandColorsData = (await CourseStatsDataLoader.load(code))?.[0];

    if (bandColorsData === undefined) {
      return [];
    }

    const bandColors = bandColorsData.color_bands.split(";").map(value => {
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
