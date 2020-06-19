import DataLoader from "dataloader";
import { compact, sortBy, toInteger, trim } from "lodash";
import { LRUMap } from "lru_map";

import { defaultPerformanceLoadUnit } from "../../constants";
import {
  PerformanceByLoadTable,
  ProgramStructureTable,
  StudentClusterTable,
  StudentCourseTable,
} from "../db/tables";

import type { PerformanceByLoad } from "../entities/data/foreplan";

export const PerformanceLoadAdvicesDataLoader = new DataLoader(
  async (keys: readonly { student_id: string; program_id: string }[]) => {
    return await Promise.all<PerformanceByLoad[]>(
      keys.map(async ({ student_id, program_id }) => {
        let [studentClusterData, performancesByLoadData] = await Promise.all([
          StudentClusterTable()
            .select("cluster")
            .where({
              student_id,
              program_id,
            })
            .first(),
          PerformanceByLoadTable().select("*").where({ program_id }),
        ]);

        const studentCluster = studentClusterData?.cluster ?? 1;
        const performancesByLoad = performancesByLoadData ?? [];

        return sortBy(
          performancesByLoad,
          ({ student_cluster }) => student_cluster
        ).map(
          ({
            id,
            courseload_lb,
            courseload_ub,
            courseload_unit,
            hp_value,
            mp_value,
            lp_value,
            message_title,
            message_text,
            cluster_label,
            student_cluster: rowStudentCluster,
          }) => {
            return {
              id,
              loadUnit: defaultPerformanceLoadUnit(courseload_unit),
              lowerBoundary: courseload_lb,
              upperBoundary: courseload_ub,
              failRateLow: toInteger(hp_value * 100),
              failRateMid: toInteger(mp_value * 100),
              failRateHigh: toInteger(lp_value * 100),
              adviceTitle: message_title,
              adviceParagraph: message_text,
              clusterLabel: cluster_label,
              isStudentCluster: rowStudentCluster === studentCluster,
            };
          }
        );
      })
    );
  },
  {
    cacheKeyFn: ({ student_id, program_id }) => student_id + program_id,
    cacheMap: new LRUMap(200),
  }
);

export const AllCoursesOfProgramCurriculumDataLoader = new DataLoader(
  async (keys: readonly { curriculum: string; program_id: string }[]) => {
    return await Promise.all(
      keys.map(async ({ curriculum, program_id }) => {
        return (
          await ProgramStructureTable()
            .select("id", "course_id", "requisites")
            .where({
              program_id,
              curriculum,
            })
        ).map(({ id, course_id, requisites }) => {
          return {
            code: course_id,
            requisites: compact(requisites?.split(",").map(trim)),
            id,
          };
        });
      })
    );
  },
  {
    cacheKeyFn: ({ curriculum, program_id }) => curriculum + program_id,
    cacheMap: new LRUMap(1000),
  }
);

export const AllApprovedCoursesDataLoader = new DataLoader(
  async (student_ids: readonly string[]) => {
    return await Promise.all(
      student_ids.map(async (student_id) => {
        return (
          await StudentCourseTable()
            .select("course_taken", "course_equiv", "elect_equiv")
            .where({
              student_id,
              state: "A",
            })
        ).reduce<Record<string, boolean>>(
          (acum, { course_equiv, course_taken, elect_equiv }) => {
            if (elect_equiv) {
              acum[elect_equiv] = true;
            }
            if (course_equiv) {
              acum[course_equiv] = true;
            }
            if (course_taken) {
              acum[course_taken] = true;
            }
            return acum;
          },
          {}
        );
      })
    );
  },
  {
    cacheMap: new LRUMap(1000),
  }
);
