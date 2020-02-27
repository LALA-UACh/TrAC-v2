import constate from "constate";
import { flatMapDeep, random, uniq } from "lodash";
import dynamic from "next/dynamic";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useUpdateEffect } from "react-use";
import { useRememberState } from "use-remember-state";

import { useMutation } from "@apollo/react-hooks";
import { Box, Flex, Stack } from "@chakra-ui/core";

import {
  NODE_ENV,
  PROGRAM_NOT_FOUND,
  PROGRAM_UNAUTHORIZED,
  StateCourse,
  STUDENT_NOT_FOUND,
  UserType,
} from "../../constants";
import { ITakenCourse } from "../../interfaces";
import { SemestersList } from "../components/dashboard/SemestersList";
import { TakenSemesterBox } from "../components/dashboard/TakenSemesterBox";
import { TimeLine } from "../components/dashboard/Timeline";
import { LoadingPage } from "../components/Loading";
import { ConfigContext } from "../context/Config";
import { CoursesDashbordManager } from "../context/CoursesDashboardContext";
import { TrackingManager, useTracking } from "../context/Tracking";
import {
  ForeplanActiveStore,
  ForeplanContextManager,
  ForeplanHelperStore,
} from "../contextNew/ForeplanContext";
import {
  DIRECT_TAKE_COURSES,
  INDIRECT_TAKE_COURSES,
  PERFORMANCE_BY_LOAD_ADVICES,
  SEARCH_PROGRAM,
  SEARCH_STUDENT,
} from "../graphql/queries";
import { DarkMode } from "../utils/dynamicDarkMode";
import {
  PersistenceLoadingProvider,
  useIsPersistenceLoading,
} from "../utils/usePersistenceLoading";
import { useUser } from "../utils/useUser";

const SearchBar = dynamic(() => import("../components/dashboard/SearchBar"));
const Dropout = dynamic(() => import("../components/dashboard/Dropout"));
const ForeplanModeSwitch = dynamic(() =>
  import("../components/foreplan/ModeSwitch")
);
const ForeplanSummary = dynamic(() =>
  import("../components/foreplan/foreplanSummary/MainBox")
);

export const [DashboardInputStateProvider, useDashboardInputState] = constate(
  () => {
    const [chosenCurriculum, setChosenCurriculum] = useState<
      string | undefined
    >(undefined);

    const { user } = useUser();

    const [mock, setMock] = useRememberState("mockMode", !!user?.admin);

    const [program, setProgram] = useState<string | undefined>(undefined);

    const [student, setStudent] = useState<string | undefined>(undefined);

    return {
      chosenCurriculum,
      setChosenCurriculum,
      program,
      setProgram,
      student,
      setStudent,
      mock,
      setMock,
    };
  }
);

const Dashboard: FC = () => {
  const {
    chosenCurriculum,
    program,
    setProgram,
    setStudent,
    mock,
    setMock,
  } = useDashboardInputState();

  const { user } = useUser();

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

  const [, { setTrackingData, track }] = useTracking();

  const [
    searchPerformanceByLoad,
    { data: dataPerformanceByLoad, error: errorPerformanceByLoad },
  ] = useMutation(PERFORMANCE_BY_LOAD_ADVICES);
  const [
    searchDirectTakeCourses,
    { data: dataDirectTakeCourses, error: errorDirectTakeCourses },
  ] = useMutation(DIRECT_TAKE_COURSES);
  const [
    searchIndirectTakeCourses,
    { data: dataIndirectTakeCourses, error: errorIndirectTakeCourses },
  ] = useMutation(INDIRECT_TAKE_COURSES);

  useEffect(() => {
    if (errorDirectTakeCourses) {
      console.error(JSON.stringify(errorDirectTakeCourses, null, 2));
    }
    if (errorIndirectTakeCourses) {
      console.error(JSON.stringify(errorIndirectTakeCourses, null, 2));
    }
    if (errorPerformanceByLoad) {
      console.error(JSON.stringify(errorPerformanceByLoad, null, 2));
    }
  }, [
    errorDirectTakeCourses,
    errorPerformanceByLoad,
    errorIndirectTakeCourses,
  ]);

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
    if (NODE_ENV !== "test" && user?.admin) {
      console.log({
        searchProgramData,
        searchStudentData,
        dataPerformanceByLoad,
        dataDirectTakeCourses,
        dataIndirectTakeCourses,
      });
    }
  }, [
    searchProgramData,
    searchStudentData,
    dataPerformanceByLoad,
    dataDirectTakeCourses,
    dataIndirectTakeCourses,
    user,
  ]);

  useEffect(() => {
    if (!user?.admin && mock) {
      setMock(false);
    }
  }, [user, mock, setMock]);

  useEffect(() => {
    setTrackingData({
      curriculum: chosenCurriculum,
    });
  }, [chosenCurriculum, setTrackingData]);

  useEffect(() => {
    if (searchStudentData?.student) {
      setMock(false);
      setTrackingData({
        student: searchStudentData.student.id,
      });
      setStudent(searchStudentData.student.id);
    } else {
      setTrackingData({
        student: undefined,
      });
      setStudent(undefined);
    }
  }, [searchStudentData, setTrackingData, setStudent]);

  useEffect(() => {
    if (searchProgramData?.program) {
      setProgram(searchProgramData.program.id);
      setTrackingData({
        showingProgress: true,
        program: searchProgramData.program.id,
      });
      setMock(false);
    } else {
      setProgram(undefined);
      setTrackingData({
        showingProgress: false,
        program: undefined,
      });
    }
  }, [searchProgramData, setTrackingData, setMock, setProgram]);

  useEffect(() => {
    if (user?.type === UserType.Student) {
      searchProgram();
      searchStudent();
      searchPerformanceByLoad();
      searchDirectTakeCourses();
      searchIndirectTakeCourses();
    }
  }, [user, searchProgram, searchStudent, searchPerformanceByLoad, setStudent]);

  const { isPersistenceLoading } = useIsPersistenceLoading();

  useEffect(() => {
    if (mock) {
      if (mockData) {
        ForeplanHelperStore.actions.setForeplanAdvices(
          mockData.default.performanceByLoad ?? []
        );
        const allCoursesOfProgram: {
          code: string;
          requisites: string[];
        }[] = [];
        mockData.default.searchProgramData.program.curriculums.forEach(
          ({ semesters }) => {
            for (const { courses } of semesters) {
              for (const { code, requisites } of courses) {
                allCoursesOfProgram.push({
                  code,
                  requisites: requisites.map(({ code }) => code),
                });
              }
            }
          }
        );
        const allApprovedCourses: Record<string, boolean> = {};
        mockData.default.searchStudentData.student.terms.forEach(
          ({ takenCourses }) => {
            for (const { state, code, equiv } of takenCourses) {
              if (state === StateCourse.Passed) {
                allApprovedCourses[code] = true;
                if (equiv) {
                  allApprovedCourses[equiv] = true;
                }
              }
            }
          }
        );

        ForeplanHelperStore.actions.setDirectTakeData(
          allCoursesOfProgram.reduce<string[]>((acum, { code, requisites }) => {
            if (
              requisites.every(requisiteCourseCode => {
                return allApprovedCourses[requisiteCourseCode] || false;
              })
            ) {
              acum.push(code);
            }
            return acum;
          }, [])
        );
        ForeplanActiveStore.actions.setNewFutureCourseRequisites(
          allCoursesOfProgram.reduce<
            {
              course: string;
              requisitesUnmet: string[];
            }[]
          >((acum, { code, requisites }) => {
            if (
              requisites.some(requisiteCourseCode => {
                return !allApprovedCourses[requisiteCourseCode];
              })
            ) {
              acum.push({
                course: code,
                requisitesUnmet: requisites.reduce<string[]>(
                  (acum, requisiteCourseCode) => {
                    if (!allApprovedCourses[requisiteCourseCode]) {
                      acum.push(requisiteCourseCode);
                    }
                    return acum;
                  },
                  []
                ),
              });
            }
            return acum;
          }, [])
        );

        const allCodes = flatMapDeep(
          mockData.default.searchProgramData.program.curriculums.map(
            ({ semesters }) => {
              return semesters.map(({ courses }) => {
                return courses.map(({ code }) => {
                  return code;
                });
              });
            }
          )
        );
        ForeplanHelperStore.actions.setFailRateData(
          allCodes.map(code => {
            return { code, failRate: Math.random() };
          })
        );
        ForeplanHelperStore.actions.setEffortData(
          allCodes.map(code => {
            return { code, effort: random(1, 5) };
          })
        );
      }
    } else {
      if (dataPerformanceByLoad?.performanceLoadAdvices) {
        ForeplanHelperStore.actions.setForeplanAdvices(
          dataPerformanceByLoad.performanceLoadAdvices
        );
      }

      if (dataDirectTakeCourses?.directTakeCourses) {
        ForeplanHelperStore.actions.setDirectTakeData(
          dataDirectTakeCourses.directTakeCourses.map(({ code }) => code)
        );
      }
      if (
        !isPersistenceLoading &&
        dataIndirectTakeCourses?.indirectTakeCourses
      ) {
        ForeplanActiveStore.actions.setNewFutureCourseRequisites(
          dataIndirectTakeCourses.indirectTakeCourses.map(
            ({ course: { code }, requisitesUnmet }) => {
              return {
                course: code,
                requisitesUnmet,
              };
            }
          )
        );
      }

      if (
        !isPersistenceLoading &&
        !dataPerformanceByLoad &&
        !dataDirectTakeCourses &&
        !dataIndirectTakeCourses
      ) {
        ForeplanActiveStore.actions.disableForeplan();
        ForeplanHelperStore.actions.setForeplanAdvices([]);
      }
    }
  }, [
    isPersistenceLoading,
    dataPerformanceByLoad,
    dataDirectTakeCourses,
    dataIndirectTakeCourses,
    mock,
    user,
    mockData,
    ForeplanActiveStore.actions,
  ]);

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
        <Flex alignItems="center" justifyContent="center" mt={0} mb={3}>
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
          {user?.config?.FOREPLAN && <ForeplanModeSwitch />}
        </Flex>
      );
      if (studentData.dropout?.active && user?.config?.SHOW_DROPOUT) {
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
          <SemestersList
            semesters={data.semesters.map(({ semester }) => semester)}
          />
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

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        track({
          action: "login",
          effect: "load-app",
          target: "website",
        });
      }, 1000);
    }
  }, [user, track]);

  const onlyProgramSearch =
    !!searchProgramData?.program && !searchStudentData?.student;

  return (
    <>
      {user?.type === UserType.Director ? (
        <SearchBar
          error={uniq(
            [
              ...(searchProgramError?.graphQLErrors ?? []),
              ...(searchStudentError?.graphQLErrors ?? []),
              ...(errorPerformanceByLoad?.graphQLErrors ?? []),
              ...(errorDirectTakeCourses?.graphQLErrors ?? []),
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
          onSearch={async ({ student_id, program_id }) => {
            try {
              if (student_id) {
                if (user.config.FOREPLAN) {
                  searchPerformanceByLoad({
                    variables: { student_id, program_id },
                  });
                  searchDirectTakeCourses({
                    variables: { student_id, program_id },
                  });
                  if (user.config.FOREPLAN_FUTURE_COURSE_PLANIFICATION) {
                    searchIndirectTakeCourses({
                      variables: { student_id, program_id },
                    });
                  }
                }
              }
              const [programSearch, studentSearch] = await Promise.all([
                searchProgram({
                  variables: {
                    id: program_id,
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
        />
      ) : (
        <>
          {searchProgramLoading || searchStudentLoading ? (
            <LoadingPage />
          ) : null}
        </>
      )}

      <Flex
        pos={onlyProgramSearch ? "relative" : "absolute"}
        width="100%"
        justifyContent="flex-end"
      >
        <DarkMode p={2} />
      </Flex>

      <ScrollContainer activationDistance={5} hideScrollbars={false}>
        <Flex>
          <Box>{TimeLineComponent}</Box>
          {DropoutComponent}
          {user?.config.FOREPLAN && <ForeplanSummary />}
        </Flex>

        <Stack isInline pl="50px">
          {TakenSemestersComponent}
        </Stack>
      </ScrollContainer>

      {SemestersComponent}

      <TrackingManager />

      {user?.config.FOREPLAN && <ForeplanContextManager />}

      <CoursesDashbordManager
        distinct={`${chosenCurriculum}${program}${mock}`}
      />
    </>
  );
};

export default () => {
  const { loading } = useUser({
    requireAuth: true,
  });

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <DashboardInputStateProvider>
      <PersistenceLoadingProvider>
        <Dashboard />
      </PersistenceLoadingProvider>
    </DashboardInputStateProvider>
  );
};
