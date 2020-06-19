import DataLoader from "dataloader";
import { defaultsDeep } from "lodash";
import { LRUMap } from "lru_map";

import {
  ProgramStructureTable,
  ProgramTable,
  StudentProgramTable,
} from "../db/tables";

import type { Curriculum } from "../entities/data/program";

export const ProgramDataLoader = new DataLoader(
  async (ids: readonly string[]) => {
    return await Promise.all(
      ids.map((id) => {
        return ProgramTable().select("*").where({ id }).first();
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);

export const StudentProgramDataLoader = new DataLoader(
  async (student_ids: readonly string[]) => {
    return await Promise.all(
      student_ids.map((student_id) => {
        return StudentProgramTable()
          .distinct("program_id", "curriculum", "start_year")
          .where({
            student_id,
          })
          .orderBy("start_year", "desc");
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);

export const ProgramDataByStudentDataLoader = new DataLoader(
  async (keys: readonly { student_id: string; program_id: string }[]) => {
    return await Promise.all(
      keys.map(({ student_id, program_id }) => {
        return ProgramTable()
          .select("id", "name", "desc", "active")
          .where({
            id: program_id,
          })
          .whereIn(
            "id",
            StudentProgramTable().distinct("program_id").where({
              student_id,
            })
          )
          .first();
      })
    );
  },
  {
    cacheKeyFn: ({ student_id, program_id }) => {
      return student_id + program_id;
    },
    cacheMap: new LRUMap(1000),
  }
);

export const StudentProgramCurriculumsDataLoader = new DataLoader(
  async (student_ids: readonly string[]) => {
    return await Promise.all(
      student_ids.map((student_id) => {
        return StudentProgramTable()
          .distinct("curriculum", "start_year")
          .where({
            student_id,
          })
          .orderBy("start_year", "desc");
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);

export const CurriculumsDataLoader = new DataLoader(
  async (
    keys: readonly { program_id: string; curriculumsIds: Curriculum[] }[]
  ) => {
    return await Promise.all(
      keys.map(async ({ program_id, curriculumsIds }) => {
        const data = curriculumsIds
          ? await ProgramStructureTable()
              .select("id", "curriculum", "semester", "course_id")
              .where({ program_id })
              .whereIn(
                "curriculum",
                curriculumsIds.map(({ id }) => id)
              )
          : await ProgramStructureTable()
              .select("id", "curriculum", "semester", "course_id")
              .where({ program_id });

        const curriculums = data.reduce<
          Record<
            string /*Curriculum id (program_structure => curriculum)*/,
            {
              id: string /*Curriculum id (program_structure => curriculum)*/;
              semesters: Record<
                number /*Semester id (program_structure => semester) (1-12)*/,
                {
                  id: number /*Semester id (program_structure => semester)*/;
                  courses: {
                    id: number /* Course-semester-curriculum id (program_structure => id) */;
                    code: string /* Course id (program_structure => course_id) */;
                  }[];
                }
              >;
            }
          >
        >((acum, { curriculum, semester, course_id, id }) => {
          defaultsDeep(acum, {
            [curriculum]: {
              id: curriculum,
              semesters: {
                [semester]: {
                  id: semester,
                  courses: [],
                },
              },
            },
          });

          acum[curriculum].semesters[semester].courses.push({
            id,
            code: course_id,
          });
          return acum;
        }, {});

        return Object.values(curriculums).map(({ id, semesters }) => {
          return {
            id,
            semesters: Object.values(semesters).map(({ id, courses }) => {
              return {
                id,
                courses,
              };
            }),
          };
        });
      })
    );
  },
  {
    cacheKeyFn: ({ program_id, curriculumsIds }) => {
      return (
        program_id +
          curriculumsIds
            ?.map(({ id }) => {
              return id;
            })
            .join("") ?? ""
      );
    },
    cacheMap: new LRUMap(50),
  }
);
