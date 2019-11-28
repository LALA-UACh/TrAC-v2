import { some } from "lodash";
import reverse from "lodash/fp/reverse";
import { FC, useEffect, useRef } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useLogger } from "react-use";

import { Box, Stack } from "@chakra-ui/core";

import { defaultStateCourse, defaultTermType } from "../../constants";
import data from "../../constants/data";
import {
  ICourse,
  IDistribution,
  ITakenCourse,
  ITakenSemester,
} from "../../interfaces";
import { Config } from "../components/dashboard/Config";
import { CoursesFlow } from "../components/dashboard/CoursesFlow";
import { Dropout } from "../components/dashboard/Dropout";
import { SearchBar } from "../components/dashboard/SearchBar";
import { Semester } from "../components/dashboard/Semester";
import { TakenSemesterBox } from "../components/dashboard/TakenSemesterBox";
import { TimeLine } from "../components/dashboard/Timeline";
import { RequireAuth } from "../components/RequireAuth";
import { Tracking, TrackingContext, TrackingRef } from "../components/Tracking";
import { searchProgramQuery, searchStudentQuery } from "../graphql/queries";
import { usePromiseLazyQuery } from "../utils/usePromiseLazyQuery";

console.log("data", data);

const Dashboard: FC = () => {
  const trackingData = useRef<TrackingRef>({ track: async () => {} });
  let semestersTaken: ITakenSemester[] = data.studentAcademic.terms.map(
    ({ year, semester }) => ({
      year,
      term: defaultTermType(semester),
    })
  );
  let semesters: {
    semester: ICourse[];
  }[] = [];
  const [
    searchProgram,
    {
      data: searchProgramData,
      loading: searchProgramLoading,
      called: searchProgramCalled,
      error: searchProgramError,
    },
  ] = usePromiseLazyQuery(searchProgramQuery);
  const [
    searchStudent,
    {
      data: searchStudentData,
      loading: searchStudentLoading,
      called: searchStudentCalled,
      error: searchStudentError,
    },
  ] = usePromiseLazyQuery(searchStudentQuery);
  data.programStructure.terms.map(
    ({
      courses,
    }: {
      courses: {
        code: string;
        name: string;
        credits: number;
        historicGroup: {
          distribution: Array<{ label: string; value: number }>;
        } | null;
        flujoMaterias: string[];
        requisites: string[];
      }[];
    }) => {
      semesters.push({
        semester: courses.map(
          ({
            code,
            name,
            credits,
            historicGroup,
            flujoMaterias,
            requisites,
          }) => {
            let historicDistribution:
              | IDistribution[]
              | undefined = historicGroup?.distribution.map(
              ({ value, label }) => ({
                value,
                min: parseFloat(label.split("-")[0]),
                max: parseFloat(label.split("-")[1]),
              })
            );

            const taken: ITakenCourse[] = [];

            reverse(data.studentAcademic.terms).forEach(
              ({ coursesTaken, semester, year }) => {
                for (const {
                  code: codeToFind,
                  classGroup: { distribution },
                  registration,
                  grade,
                  state,
                } of coursesTaken) {
                  let currentDistribution = distribution.map(
                    ({ value, label }) => ({
                      value,
                      min: parseFloat(label.split("-")[0]),
                      max: parseFloat(label.split("-")[1]),
                    })
                  );

                  if (codeToFind === code) {
                    taken.push({
                      term: defaultTermType(semester),
                      year,
                      registration,
                      grade,
                      state: defaultStateCourse(state),
                      currentDistribution,
                      parallelGroup: 0,
                    });
                  }
                }
              }
            );
            return {
              name,
              code,
              credits: [{ label: "SCT", value: credits }],
              flow: flujoMaterias,
              requisites,
              historicDistribution: some(
                historicDistribution,
                ({ value }) => value
              )
                ? historicDistribution
                : [],
              taken,
            };
          }
        ),
      });
    }
  );

  useLogger("index", {
    searchProgramData,
    searchStudentData,
  });

  useEffect(() => {
    if (searchStudentData) {
      trackingData.current.program = searchStudentData.student.program.id;
      trackingData.current.curriculum = searchStudentData.student.curriculum;
      trackingData.current.showingProgress = true;
      trackingData.current.student = searchStudentData.student.id;
    } else {
      trackingData.current.showingProgress = false;
    }
  }, [searchStudentData]);

  return (
    <Config>
      <TrackingContext.Provider value={trackingData}>
        <SearchBar
          error={`${searchProgramError?.graphQLErrors
            .map(({ message }) => message)
            .join("\n") ?? ""}\n\n${searchStudentError?.graphQLErrors
            .map(({ message }) => message)
            .join("\n") ?? ""}`.trim()}
          searchResult="| Plan: 2015 | estudiante: 19233043-2"
          isSearchLoading={searchProgramLoading || searchStudentLoading}
          onSearch={async ({ student_id, program_id }) => {
            const [programSearch, studentSearch] = await Promise.all([
              searchProgram({ variables: { program_id } }),
              searchStudent({ variables: { student_id, program_id } }),
            ]);

            if (programSearch.data?.program && studentSearch.data?.student) {
              return true;
            }
            return false;
          }}
        />
        <CoursesFlow>
          <ScrollContainer activationDistance={5} hideScrollbars={false}>
            <Stack isInline flexWrap="wrap-reverse">
              <Box>
                <TimeLine
                  CUMULATED_GRADE={data.PGA}
                  SEMESTRAL_GRADE={data.PSP}
                  PROGRAM_GRADE={data.ProgramPGA}
                  semestersTaken={semestersTaken}
                />
              </Box>
              <Dropout
                probability={data.studentAcademic.student_dropout.prob_dropout}
                accuracy={data.studentAcademic.student_dropout.model_accuracy}
              />
            </Stack>

            <Stack isInline pl="50px">
              {semestersTaken.map(({ term, year }, key) => {
                return <TakenSemesterBox key={key} term={term} year={year} />;
              })}
            </Stack>
          </ScrollContainer>

          <ScrollContainer
            hideScrollbars={false}
            vertical={false}
            activationDistance={5}
          >
            <Stack isInline spacing={8}>
              {semesters.map(({ semester }, key) => {
                return <Semester key={key} semester={semester} n={key + 1} />;
              })}
            </Stack>
          </ScrollContainer>
          <Tracking />
        </CoursesFlow>
      </TrackingContext.Provider>
    </Config>
  );
};

export default () => {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
};
