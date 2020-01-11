import DataLoader from "dataloader";
import { trim } from "lodash";

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

    const data = await Promise.all<{
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
    );

    return program_structure_ids.map(key => {
      return data.find(({ id }) => {
        return id === key;
      })?.courses;
    });
  }
);

export const CourseFlowDataLoader = new DataLoader(
  async (keys: readonly { id: number; code: string }[]) => {
    const data = await Promise.all(
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
    );
    return keys.map(key => {
      return data.find(obj => {
        return obj.key.code === key.code && obj.key.id === key.id;
      })?.data;
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

    return keys.map(key => {
      return {
        courseTable: courseTableData.find(({ id }) => {
          return id === key.code;
        }),
        programStructureTable: programStructureData.find(({ id }) => {
          return id === key.id;
        }),
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
    const data = await Promise.all<{ key: string; stats: ICourseStats[] }>(
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
    );
    return keys.map(key => {
      return data.find(obj => {
        return obj.key === key;
      })?.stats;
    });
  }
);
