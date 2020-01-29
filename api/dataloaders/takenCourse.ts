import DataLoader from "dataloader";
import { LRUMap } from "lru_map";

import { CourseStatsTable, StudentCourseTable } from "../db/tables";

export const StudentCourseDataLoader = new DataLoader(
  async (ids: readonly number[]) => {
    return await Promise.all(
      ids.map(id => {
        return StudentCourseTable()
          .select("*")
          .where({ id })
          .first();
      })
    );
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
    return await Promise.all(
      codes.map(course_taken => {
        return CourseStatsTable()
          .select("color_bands")
          .where({
            course_taken,
          })
          .first();
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);
