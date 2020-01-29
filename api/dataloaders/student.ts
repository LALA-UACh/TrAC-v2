import DataLoader from "dataloader";
import { LRUMap } from "lru_map";

import {
  IProgram,
  IStudent,
  STUDENT_PROGRAM_TABLE,
  STUDENT_TABLE,
  StudentDropoutTable,
  StudentProgramTable,
  StudentTermTable,
} from "../db/tables";
import { TermDataLoader } from "./term";

export const StudentDataLoader = new DataLoader(
  async (student_ids: readonly string[]) => {
    return await Promise.all(
      student_ids.map(student_id => {
        return StudentProgramTable()
          .select("program_id", "name", "state")
          .innerJoin<IStudent>(
            STUDENT_TABLE,
            `${STUDENT_TABLE}.id`,
            `${STUDENT_PROGRAM_TABLE}.student_id`
          )
          .orderBy("start_year", "desc")
          .where({ student_id })
          .first();
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);

export const StudentLastProgramDataLoader = new DataLoader(
  async (student_ids: readonly string[]) => {
    return await Promise.all(
      student_ids.map(student_id => {
        return StudentProgramTable()
          .select("*")
          .orderBy("start_year", "desc")
          .where({
            student_id,
          })
          .first();
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);

export const StudentProgramsDataLoader = new DataLoader(
  async (student_ids: readonly string[]) => {
    return await Promise.all(
      student_ids.map(student_id => {
        return StudentProgramTable()
          .distinct("program_id")
          .where({
            student_id,
          });
      })
    );
  },
  {
    cacheMap: new LRUMap(5000),
  }
);

export const StudentTermsDataLoader = new DataLoader(
  async (
    student_ids: readonly {
      student_id: string;
      programs?: Pick<IProgram, "id">[];
    }[]
  ) => {
    return await Promise.all(
      student_ids.map(async ({ student_id, programs }) => {
        if (!programs) {
          programs = (await StudentProgramsDataLoader.load(student_id)).map(
            ({ program_id }) => {
              return { id: program_id };
            }
          );
        }

        const studentTermData = await StudentTermTable()
          .select("*")
          .where({ student_id })
          .whereIn(
            "program_id",
            programs.map(({ id }) => id)
          )
          .orderBy([
            { column: "year", order: "desc" },
            { column: "term", order: "desc" },
          ]);
        for (const studentTerm of studentTermData) {
          TermDataLoader.prime(studentTerm.id, studentTerm);
        }

        return studentTermData;
      })
    );
  },
  {
    cacheKeyFn: key => {
      return key.student_id;
    },
    cacheMap: new LRUMap(1000),
  }
);

export const StudentDropoutDataLoader = new DataLoader(
  async (student_ids: readonly string[]) => {
    return await Promise.all(
      student_ids.map(student_id => {
        return StudentDropoutTable()
          .where({ student_id })
          .first();
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);

export const StudentListDataLoader = new DataLoader(
  async (program_ids: readonly string[]) => {
    return await Promise.all(
      program_ids.map(program_id => {
        return StudentProgramTable()
          .select("id", "name", "state", "last_term")
          .rightJoin<IStudent>(
            STUDENT_TABLE,
            `${STUDENT_PROGRAM_TABLE}.student_id`,
            `${STUDENT_TABLE}.id`
          )
          .where({
            program_id,
          });
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);
