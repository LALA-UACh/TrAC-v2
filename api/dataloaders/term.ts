import DataLoader from "dataloader";
import { Dictionary, keyBy, uniqBy } from "lodash";
import { LRUMap } from "lru_map";

import {
  IStudentTerm,
  ProgramTable,
  StudentCourseTable,
  StudentTermTable,
} from "../db/tables";

export const TermDataLoader = new DataLoader(
  async (ids: readonly number[]) => {
    const dataDict: Dictionary<IStudentTerm | undefined> = keyBy(
      await StudentTermTable().select("*").whereIn("id", ids),
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

export const ProgramGradeDataLoader = new DataLoader(
  async (ids: readonly number[]) => {
    return await Promise.all(
      ids.map(async (id) => {
        return (
          await ProgramTable()
            .select("last_gpa")
            .where(
              "id",
              StudentTermTable().select("program_id").where({ id }).first()
            )
            .first()
        )?.last_gpa;
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);

export const TakenCoursesDataLoader = new DataLoader(
  async (
    ids: readonly { year: number; term: number; student_id: string }[]
  ) => {
    return await Promise.all(
      ids.map(async ({ year, term, student_id }) => {
        const takenCoursesData = await StudentCourseTable()
          .select("id", "course_taken", "course_equiv", "elect_equiv")
          .where({
            year,
            term,
            student_id,
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

        return uniqBy(takenCoursesData, ({ course_taken }) => course_taken);
      })
    );
  },
  {
    cacheKeyFn: ({ year, term, student_id }) => {
      return year + student_id + term;
    },
    cacheMap: new LRUMap(1000),
  }
);
