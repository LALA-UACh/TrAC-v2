import { FC, useEffect, useMemo, useRef } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useLogger } from "react-use";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";
import { Box, Stack } from "@chakra-ui/core";

import mockDropout from "../../constants/mockData/dropout";
import mockSemesters from "../../constants/mockData/semesters";
import mockSemestersTaken from "../../constants/mockData/semestersTaken";
import mockTimeline from "../../constants/mockData/timeline";
import { ITakenCourse } from "../../interfaces";
import { Config } from "../components/dashboard/Config";
import { CoursesFlow } from "../components/dashboard/CoursesFlow";
import { Dropout } from "../components/dashboard/Dropout";
import { SearchBar } from "../components/dashboard/SearchBar";
import { Semester } from "../components/dashboard/Semester";
import { TakenSemesterBox } from "../components/dashboard/TakenSemesterBox";
import { TimeLine } from "../components/dashboard/Timeline";
import { RequireAuth } from "../components/RequireAuth";
import { Tracking, TrackingContext, TrackingRef } from "../components/Tracking";
import {
  currentUserQuery,
  searchProgramQuery,
  searchStudentQuery,
} from "../graphql/queries";
import { usePromiseLazyQuery } from "../utils/usePromiseLazyQuery";

const Dashboard: FC = () => {
  const { data: currentUserData } = useQuery(currentUserQuery, {
    fetchPolicy: "cache-only",
  });
  const [mock, setMock] = useRememberState(
    "mockMode",
    !!currentUserData?.currentUser?.admin
  );
  const trackingData = useRef<TrackingRef>({ track: async () => {} });
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

  useLogger("index", {
    searchProgramData,
    searchStudentData,
  });

  useEffect(() => {
    if (!currentUserData?.currentUser?.admin && mock === true) {
      setMock(false);
    }
  }, [currentUserData, mock, setMock]);

  useEffect(() => {
    if (searchStudentData) {
      setMock(false);
      trackingData.current.program = searchStudentData.student.program.id;
      trackingData.current.curriculum = searchStudentData.student.curriculum;
      trackingData.current.showingProgress = true;
      trackingData.current.student = searchStudentData.student.id;
    } else {
      trackingData.current.showingProgress = false;
    }
  }, [searchStudentData]);

  const {
    TimeLineComponent,
    TakenSemestersComponent,
    SemestersComponent,
    DropoutComponent,
  } = useMemo(() => {
    let TimeLineComponent: JSX.Element | null = null;
    let DropoutComponent: JSX.Element | null = null;
    let TakenSemestersComponent: JSX.Element | null = null;
    let SemestersComponent: JSX.Element | null = null;

    if (searchStudentData) {
      const {
        cumulated_grade,
        semestral_grade,
        program_grade,
        semestersTaken,
      } = searchStudentData.student.terms.reduce<{
        cumulated_grade: number[];
        semestral_grade: number[];
        program_grade: number[];
        semestersTaken: { year: number; term: string }[];
      }>(
        (acum, value) => {
          acum.semestersTaken.push({
            year: value.year,
            term: value.term,
          });
          acum.cumulated_grade.push(value.cumulated_grade);
          acum.semestral_grade.push(value.semestral_grade);
          acum.program_grade.push(value.program_grade);
          // TODO: Program_grade should be from curriculum, not from student
          return acum;
        },
        {
          cumulated_grade: [],
          semestral_grade: [],
          program_grade: [],
          semestersTaken: [],
        }
      );
      TimeLineComponent = (
        <TimeLine
          CUMULATED_GRADE={cumulated_grade}
          SEMESTRAL_GRADE={semestral_grade}
          PROGRAM_GRADE={program_grade}
          semestersTaken={semestersTaken}
        />
      );
      TakenSemestersComponent = (
        <>
          {searchStudentData.student.terms.map(({ term, year }, key) => {
            return <TakenSemesterBox key={key} term={term} year={year} />;
          })}
        </>
      );
      if (
        searchStudentData.student.dropout?.active &&
        currentUserData?.currentUser?.show_dropout
      ) {
        DropoutComponent = (
          <Dropout
            probability={searchStudentData.student.dropout.prob_dropout}
            accuracy={searchStudentData.student.dropout.model_accuracy}
          />
        );
      }
    }
    if (searchProgramData) {
      const curriculums = searchProgramData.program.curriculums.map(
        ({ semesters: curriculumSemesters, id: curriculumId }) => {
          const semesters = curriculumSemesters.map(va => {
            const semester = va.courses.map(
              ({
                code,
                name,
                credits,
                flow,
                requisites,
                historicalDistribution,
              }) => {
                return {
                  code,
                  name,
                  credits,
                  flow: flow.map(({ code }) => {
                    return code;
                  }),
                  requisites: requisites.map(({ code }) => {
                    return code;
                  }),
                  historicalDistribution,
                  taken: (() => {
                    const taken: ITakenCourse[] = [];
                    if (searchStudentData) {
                      for (const {
                        term,
                        year,
                        takenCourses,
                      } of searchStudentData.student.terms) {
                        for (const {
                          code: courseCode,
                          registration,
                          state,
                          grade,
                          currentDistribution,
                          parallelGroup,
                        } of takenCourses) {
                          if (courseCode === code) {
                            taken.push({
                              term,
                              year,
                              registration,
                              state,
                              grade,
                              currentDistribution,
                              parallelGroup,
                            });
                          }
                        }
                      }
                    }

                    return taken;
                  })(),
                };
              }
            );
            return { semester };
          });
          return { id: curriculumId, semesters };
        }
      );
      //TODO: Choose curriculum by id
      const data = curriculums[0];
      if (data) {
        SemestersComponent = (
          <>
            {data.semesters.map(({ semester }, key) => {
              return <Semester key={key} semester={semester} n={key + 1} />;
            })}
          </>
        );
      }
    }

    return {
      TimeLineComponent,
      DropoutComponent,
      TakenSemestersComponent,
      SemestersComponent,
    };
  }, [searchStudentData, searchProgramData]);

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
          mock={mock}
          setMock={setMock}
        />
        <CoursesFlow>
          <ScrollContainer activationDistance={5} hideScrollbars={false}>
            <Stack isInline flexWrap="wrap-reverse">
              <Box>
                {mock ? (
                  <TimeLine
                    CUMULATED_GRADE={mockTimeline.PGA}
                    SEMESTRAL_GRADE={mockTimeline.PSP}
                    PROGRAM_GRADE={mockTimeline.ProgramPGA}
                    semestersTaken={mockSemestersTaken}
                  />
                ) : (
                  TimeLineComponent
                )}
              </Box>
              {mock ? (
                <Dropout
                  probability={mockDropout.prob_dropout}
                  accuracy={mockDropout.model_accuracy}
                />
              ) : (
                DropoutComponent
              )}
            </Stack>

            <Stack isInline pl="50px">
              {mock
                ? mockSemestersTaken.map(({ term, year }, key) => {
                    return (
                      <TakenSemesterBox key={key} term={term} year={year} />
                    );
                  })
                : TakenSemestersComponent}
            </Stack>
          </ScrollContainer>

          <ScrollContainer
            hideScrollbars={false}
            vertical={false}
            activationDistance={5}
          >
            <Stack isInline spacing={8}>
              {mock
                ? mockSemesters.map(({ semester }, key) => {
                    return (
                      <Semester key={key} semester={semester} n={key + 1} />
                    );
                  })
                : SemestersComponent}
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
