import { uniq } from "lodash";
import dynamic from "next/dynamic";
import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useMount, useUpdateEffect } from "react-use";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Box, Flex, Spinner, Stack } from "@chakra-ui/core";

import {
  PROGRAM_NOT_FOUND,
  PROGRAM_UNAUTHORIZED,
  STUDENT_NOT_FOUND,
  UserType,
} from "../../constants";
import { ITakenCourse } from "../../interfaces";
import { ConfigContext } from "../components/Config";
import { CoursesFlow } from "../components/dashboard/CoursesFlow";
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

const SearchBar = dynamic(() => import("../components/dashboard/SearchBar"));
const Dropout = dynamic(() => import("../components/dashboard/Dropout"));

const Dashboard: FC = () => {
  const [program, setProgram] = useState<string | undefined>(undefined);

  const [chosenCurriculum, setChosenCurriculum] = useState<string | undefined>(
    undefined
  );

  const { data: currentUserData } = useQuery(CURRENT_USER, {
    fetchPolicy: "cache-only",
  });

  const [mock, setMock] = useRememberState(
    "mockMode",
    !!currentUserData?.currentUser?.user?.admin
  );

  const [mockData, setMockData] = useState<
    typeof import("../../constants/mockData")
  >();
  useEffect(() => {
    if (mock && !mockData) {
      import("../../constants/mockData").then(data => {
        setMockData(data);
      });
    }
  }, [mock, mockData, setMockData]);

  const trackingData = useRef<TrackingRef>({ track: async () => {} });
  const [
    searchProgram,
    {
      data: searchProgramData,
      loading: searchProgramLoading,
      error: searchProgramError,
    },
  ] = useMutation(SEARCH_PROGRAM);

  const [
    searchStudent,
    {
      data: searchStudentData,
      loading: searchStudentLoading,
      error: searchStudentError,
    },
  ] = useMutation(SEARCH_STUDENT);

  useUpdateEffect(() => {
    if (process.env.NODE_ENV !== "test") {
      console.log({
        searchProgramData,
        searchStudentData,
      });
    }
  }, [searchProgramData, searchStudentData]);

  useEffect(() => {
    if (!currentUserData?.currentUser?.user?.admin && mock) {
      setMock(false);
    }
  }, [currentUserData, mock, setMock]);

  useEffect(() => {
    trackingData.current.curriculum = chosenCurriculum;
  }, [chosenCurriculum]);

  useEffect(() => {
    if (searchStudentData?.student) {
      setMock(false);
      trackingData.current.student = searchStudentData.student.id;
    } else {
      trackingData.current.student = undefined;
    }
  }, [searchStudentData]);

  useEffect(() => {
    if (searchProgramData?.program) {
      trackingData.current.showingProgress = true;
      trackingData.current.program = searchProgramData.program.id;
      setMock(false);
    } else {
      trackingData.current.showingProgress = false;
      trackingData.current.program = undefined;
    }
  }, [searchProgramData]);

  useEffect(() => {
    if (currentUserData?.currentUser?.user?.type === UserType.Student) {
      searchProgram();
      searchStudent();
    }
  }, [currentUserData, searchProgram, searchStudent]);

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

    const studentData = mock
      ? mockData?.default.searchStudentData.student
      : searchStudentData?.student;
    const programData = mock
      ? mockData?.default.searchProgramData.program
      : searchProgramData?.program;

    if (studentData) {
      const {
        cumulated_grade,
        semestral_grade,
        program_grade,
        semestersTaken,
      } = studentData.terms.reduce<{
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
          cumulatedGrades={cumulated_grade.slice().reverse()}
          semestralGrades={semestral_grade.slice().reverse()}
          programGrades={program_grade.slice().reverse()}
          semestersTaken={semestersTaken.slice().reverse()}
        />
      );
      TakenSemestersComponent = (
        <Flex alignItems="center">
          {studentData.terms
            .slice()
            .reverse()
            .map(({ term, year, comments }, key) => {
              return (
                <TakenSemesterBox
                  key={key}
                  term={term}
                  year={year}
                  comments={comments}
                />
              );
            })}
        </Flex>
      );
      if (
        studentData.dropout?.active &&
        currentUserData?.currentUser?.user?.config?.SHOW_DROPOUT
      ) {
        DropoutComponent = (
          <Dropout
            probability={studentData.dropout.prob_dropout}
            accuracy={studentData.dropout.model_accuracy}
          />
        );
      }
    }
    if (programData) {
      const curriculums =
        programData?.curriculums
          .filter(({ id }) => {
            if (studentData) {
              return studentData.curriculums.includes(id);
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
                        if (studentData) {
                          for (const {
                            term,
                            year,
                            takenCourses,
                          } of studentData.terms) {
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
        return !mock && chosenCurriculum
          ? curriculumId === chosenCurriculum
          : true;
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
  }, [searchStudentData, searchProgramData, chosenCurriculum, mock, mockData]);

  const {
    ERROR_STUDENT_NOT_FOUND_MESSAGE,
    ERROR_PROGRAM_UNAUTHORIZED_MESSAGE,
    ERROR_PROGRAM_NOT_FOUND,
  } = useContext(ConfigContext);

  useMount(() => {
    setTimeout(() => {
      trackingData.current.track({
        action: "login",
        effect: "load-app",
        target: "website",
      });
    }, 1000);
  });

  return (
    <TrackingContext.Provider value={trackingData}>
      {currentUserData?.currentUser?.user?.type === UserType.Director ? (
        <SearchBar
          error={uniq(
            [
              ...(searchProgramError?.graphQLErrors ?? []),
              ...(searchStudentError?.graphQLErrors ?? []),
            ].map(({ message }) => {
              switch (message) {
                case STUDENT_NOT_FOUND:
                  return ERROR_STUDENT_NOT_FOUND_MESSAGE;
                case PROGRAM_UNAUTHORIZED:
                  return ERROR_PROGRAM_UNAUTHORIZED_MESSAGE;
                case PROGRAM_NOT_FOUND:
                  return ERROR_PROGRAM_NOT_FOUND;
                default:
                  return message;
              }
            })
          )
            .join("\n")
            .trim()}
          searchResult={{
            curriculums:
              searchProgramData?.program?.curriculums?.map(({ id }) => {
                return id;
              }) ?? [],
            student: searchStudentData?.student?.id,
            program_id: searchProgramData?.program?.id,
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

              if (studentSearch.data?.student && programSearch.data?.program) {
                return "student";
              } else if (programSearch.data?.program) {
                return "program";
              }
            } catch (err) {
              console.error(err);
            }

            return undefined;
          }}
          mock={mock}
          setMock={setMock}
          curriculum={chosenCurriculum}
          setCurriculum={setChosenCurriculum}
        />
      ) : (
        <>
          {searchProgramLoading || searchStudentLoading ? (
            <Flex
              justifyContent="center"
              alignItems="center"
              height="100vh"
              width="100vw"
            >
              <Spinner size="xl" />
            </Flex>
          ) : null}
        </>
      )}
      <CoursesFlow curriculum={chosenCurriculum} program={program} mock={mock}>
        <ScrollContainer activationDistance={5} hideScrollbars={false}>
          <Flex>
            <Box>{TimeLineComponent}</Box>
            {DropoutComponent}
          </Flex>

          <Stack isInline pl="50px">
            {TakenSemestersComponent}
          </Stack>
        </ScrollContainer>

        <ScrollContainer
          hideScrollbars={false}
          vertical={false}
          activationDistance={5}
        >
          <Stack isInline spacing={8}>
            {SemestersComponent}
          </Stack>
        </ScrollContainer>
        <Tracking />
      </CoursesFlow>
    </TrackingContext.Provider>
  );
};

export default () => {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
};
