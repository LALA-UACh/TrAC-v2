import DataLoader from "dataloader";
import { keyBy, trim } from "lodash";

import {
  CourseStatsTable,
  CourseTable,
  ICourseStats,
  ProgramStructureTable,
} from "../db/tables";

export const CourseRequisitesLoader = new DataLoader(
  async (program_structure_ids: readonly number[]) => {
    const programStructures = await ProgramStructureTable()
      .select("requisites", "id")
      .whereIn("id", program_structure_ids as number[]);

    const data = keyBy(
      await Promise.all<{
        courses: {
          id: number;
          code: string;
        }[];
        id: number;
      }>(
        programStructures.map(async ({ requisites, id }) => {
          const courses = await ProgramStructureTable()
            .select("id", "course_id as code")
            .whereIn("course_id", requisites?.split(",").map(trim) ?? []);

          return { courses, id };
        })
      ),
      "id"
    );

    return program_structure_ids.map(key => {
      return data[key]?.courses;
    });
  }
);

export const CourseFlowDataLoader = new DataLoader(
  async (keys: readonly { id: number; code: string }[]) => {
    const data = keyBy(
      await Promise.all(
        keys.map(async key => {
          const flowData = (
            await ProgramStructureTable()
              .select("id", "course_id", "requisites")
              .whereIn(
                "curriculum",
                ProgramStructureTable()
                  .select("curriculum")
                  .where({ id: key.id })
              )
          ).map(({ course_id, ...rest }) => ({ ...rest, code: course_id }));

          return {
            data: flowData
              .filter(({ requisites }) => {
                return requisites.includes(key.code);
              })
              .map(({ id, code }) => ({ id, code })),
            key,
          };
        })
      ),
      ({ key }) => key.id + key.code
    );
    return keys.map(key => {
      return data[key.id + key.code]?.data;
    });
  },
  {
    cacheKeyFn: key => {
      return key.id + key.code;
    },
  }
);

export const CourseDataLoader = new DataLoader(
  async (keys: readonly { id: number; code: string }[]) => {
    const [courseTableData, programStructureData] = await Promise.all([
      CourseTable()
        .select("*")
        .whereIn(
          "id",
          keys.map(({ code }) => code)
        ),
      ProgramStructureTable()
        .select("*")
        .whereIn(
          "id",
          keys.map(({ id }) => id)
        ),
    ]);

    const hashCourseTableData = keyBy(courseTableData, "id");
    const hashProgramStructureData = keyBy(programStructureData, "id");

    return keys.map(key => {
      return {
        courseTable: hashCourseTableData[key.code],
        programStructureTable: hashProgramStructureData[key.id],
      };
    });
  },
  {
    cacheKeyFn: key => {
      return key.id + key.code;
    },
  }
);

export const CourseStatsDataLoader = new DataLoader(
  async (keys: readonly string[]) => {
    const data = keyBy(
      await Promise.all<{ key: string; stats: ICourseStats[] }>(
        keys.map(async key => {
          const stats = await CourseStatsTable()
            .select("*")
            .where({
              course_taken: key,
            });

          return {
            key,
            stats,
          };
        })
      ),
      "key"
    );
    return keys.map(key => {
      return data[key]?.stats;
    });
  }
);
