import DataLoader from "dataloader";
import { Dictionary, keyBy } from "lodash";
import { LRUMap } from "lru_map";

import {
  CourseStatsTable,
  ICourseStats,
  IStudentCourse,
  StudentCourseTable,
} from "../db/tables";

export const StudentCourseDataLoader = new DataLoader(
  async (ids: readonly number[]) => {
    const dataDict: Dictionary<IStudentCourse | undefined> = keyBy(
      await StudentCourseTable().select("*").whereIn("id", ids),
      "id"
    );

    return ids.map((id) => {
      return dataDict[id];
    });
  },
  {
    cacheMap: new LRUMap(1000),
  }
);

export const CourseStatsByStateDataLoader = new DataLoader(
  async (
    keys: readonly {
      course_taken: string;
      year: number;
      term: number;
      p_group: number;
    }[]
  ) => {
    return await Promise.all(
      keys.map(({ course_taken, year, term, p_group }) => {
        return CourseStatsTable()
          .select("histogram", "histogram_labels", "color_bands")
          .where({
            course_taken,
            year,
            term,
            p_group,
          })
          .first();
      })
    );
  },
  {
    cacheKeyFn: ({ course_taken, year, term, p_group }) => {
      return `${course_taken}${year}${term}${p_group}`;
    },
    cacheMap: new LRUMap(1000),
  }
);

export const CourseStatsByCourseTakenDataLoader = new DataLoader(
  async (codes: readonly string[]) => {
    const dataDict: Dictionary<
      Pick<ICourseStats, "course_taken" | "color_bands"> | undefined
    > = keyBy(
      await CourseStatsTable()
        .select("color_bands", "course_taken")
        .whereIn("course_taken", codes),
      "course_taken"
    );

    return codes.map((course_taken) => {
      return dataDict[course_taken];
    });
  },
  {
    cacheMap: new LRUMap(1000),
  }
);
