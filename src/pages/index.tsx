import { uniq } from "lodash";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useLogger } from "react-use";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
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
  CURRENT_USER,
  SEARCH_PROGRAM,
  SEARCH_STUDENT,
} from "../graphql/queries";

const Dashboard: FC = () => {
  const [program, setProgram] = useState<string | undefined>(undefined);
  const [curriculum, setCurriculum] = useState<string | undefined>(undefined);
  const { data: currentUserData } = useQuery(CURRENT_USER, {
    fetchPolicy: "cache-only",
  });
  const [mock, setMock] = useRememberState(
    "mockMode",
    !!currentUserData?.currentUser?.user?.admin
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
  ] = useMutation(SEARCH_PROGRAM);
  const [
    searchStudent,
    {
      data: searchStudentData,
      loading: searchStudentLoading,
      called: searchStudentCalled,
      error: searchStudentError,
    },
  ] = useMutation(SEARCH_STUDENT);

  useLogger("index", {
    searchProgramData,
    searchStudentData,
  });

  useEffect(() => {
    if (!currentUserData?.currentUser?.user?.admin && mock === true) {
      setMock(false);
    }
  }, [currentUserData, mock, setMock]);

  useEffect(() => {
    if (searchStudentData?.student) {
      setMock(false);
      trackingData.current.program = searchStudentData.student.programs[0].id;
      trackingData.current.curriculum =
        searchStudentData.student.curriculums[0];
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

    if (searchStudentData?.student) {
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
          CUMULATED_GRADE={cumulated_grade.slice().reverse()}
          SEMESTRAL_GRADE={semestral_grade.slice().reverse()}
          PROGRAM_GRADE={program_grade.slice().reverse()}
          semestersTaken={semestersTaken.slice().reverse()}
        />
      );
      TakenSemestersComponent = (
        <>
          {searchStudentData.student.terms
            .slice()
            .reverse()
            .map(({ term, year }, key) => {
              return <TakenSemesterBox key={key} term={term} year={year} />;
            })}
        </>
      );
      if (
        searchStudentData.student.dropout?.active &&
        currentUserData?.currentUser?.user?.show_dropout
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
      const curriculums =
        searchProgramData?.program?.curriculums
          .filter(({ id }) => {
            if (searchStudentData?.student) {
              return searchStudentData.student.curriculums.includes(id);
            }
            return true;
          })
          .map(({ semesters: curriculumSemesters, id: curriculumId }) => {
            const semesters = curriculumSemesters.map(va => {
              const semester = {
                n: va.id,
                courses: va.courses.map(
                  ({
                    code,
                    name,
                    credits,
                    flow,
                    requisites,
                    historicalDistribution,
                    bandColors,
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
                      historicDistribution: historicalDistribution,
                      bandColors,
                      taken: (() => {
                        const taken: ITakenCourse[] = [];
                        if (searchStudentData?.student) {
                          for (const {
                            term,
                            year,
                            takenCourses,
                          } of searchStudentData.student.terms) {
                            for (const {
                              code: courseCode,
                              equiv,
                              registration,
                              state,
                              grade,
                              currentDistribution,
                              parallelGroup,
                              bandColors,
                            } of takenCourses) {
                              if (equiv === code || courseCode === code) {
                                taken.push({
                                  term,
                                  year,
                                  registration,
                                  state,
                                  grade,
                                  currentDistribution,
                                  parallelGroup,
                                  equiv: equiv === code ? courseCode : "",
                                  bandColors,
                                });
                              }
                            }
                          }
                        }

                        return taken;
                      })(),
                    };
                  }
                ),
              };
              return { semester };
            });
            return { id: curriculumId, semesters };
          }) ?? [];
      const data = curriculums.find(({ id: curriculumId }) => {
        return curriculum ? curriculumId === curriculum : true;
      });
      if (data) {
        SemestersComponent = (
          <>
            {data.semesters.map(({ semester: { courses, n } }, key) => {
              return <Semester key={key} courses={courses} n={n} />;
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
  }, [searchStudentData, searchProgramData, curriculum]);

  return (
    <Config>
      <TrackingContext.Provider value={trackingData}>
        <SearchBar
          error={`${uniq(
            [
              ...(searchProgramError?.graphQLErrors ?? []),
              ...(searchStudentError?.graphQLErrors ?? []),
            ].map(({ message }) => message)
          ).join("\n") ?? ""}`.trim()}
          searchResult={{
            curriculums:
              searchProgramData?.program?.curriculums?.map(({ id }) => {
                return id;
              }) ?? [],
            student: searchStudentData?.student?.id,
          }}
          isSearchLoading={searchProgramLoading || searchStudentLoading}
          setProgram={setProgram}
          onSearch={async ({ student_id, program_id }) => {
            try {
              const [programSearch, studentSearch] = await Promise.all([
                searchProgram({
                  variables: {
                    program_id,
                    student_id: student_id || undefined,
                  },
                }),
                searchStudent({
                  variables: { student_id, program_id },
                }),
              ]);

              if (programSearch.data?.program && studentSearch.data?.student) {
                return true;
              }
            } catch (err) {
              console.error(err);
            }

            return false;
          }}
          mock={mock}
          setMock={setMock}
          curriculum={curriculum}
          setCurriculum={setCurriculum}
        />
        <CoursesFlow curriculum={curriculum} program={program}>
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
                      <Semester key={key} courses={semester} n={key + 1} />
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
