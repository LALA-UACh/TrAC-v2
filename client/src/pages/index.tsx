import { flatMapDeep, random, uniq } from "lodash";
import dynamic from "next/dynamic";
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useUpdateEffect } from "react-use";

import { Box, Flex, Stack, useToast } from "@chakra-ui/react";

import {
  IS_NOT_TEST,
  PROGRAM_NOT_FOUND,
  PROGRAM_UNAUTHORIZED,
  StateCourse,
  STUDENT_NOT_FOUND,
  UserType,
} from "../../constants";
import { SearchBar } from "../components/dashboard/SearchBar";
import { SemestersList } from "../components/dashboard/SemestersList";
import { TakenSemesterBox } from "../components/dashboard/TakenSemesterBox";
import { TimeLine } from "../components/dashboard/Timeline";
import { Feedback } from "../components/feedback";
import { LoadingPage } from "../components/Loading";
import { ConfigContext } from "../context/Config";
import { CoursesDashbordManager } from "../context/CoursesDashboard";
import {
  DashboardInputActions,
  setMock,
  useChosenCurriculum,
  useIsMockActive,
  useProgram,
} from "../context/DashboardInput";
import {
  ForeplanActiveStore,
  ForeplanContextManager,
  ForeplanHelperStore,
} from "../context/ForeplanContext";
import { useIsPersistenceLoading } from "../context/PersistenceLoading";
import { setTrackingData, track, TrackingManager } from "../context/Tracking";
import {
  useDirectTakeCoursesMutation,
  useIndirectTakeCoursesMutation,
  usePerformanceLoadAdvicesMutation,
  useSearchProgramMutation,
  useSearchStudentMutation,
} from "../graphql";
import { DarkMode } from "../utils/dynamicDarkMode";
import { useUser } from "../utils/useUser";

import type { ITakenCourse } from "../../../interfaces";
const Dropout = dynamic(() => import("../components/dashboard/Dropout"));
const ForeplanModeSwitch = dynamic(
  () => import("../components/foreplan/ModeSwitch")
);
const ForeplanSummary = dynamic(
  () => import("../components/foreplan/foreplanSummary/MainBox")
);

const Dashboard: FC = () => {
  const mock = useIsMockActive();
  const chosenCurriculum = useChosenCurriculum();
  const program = useProgram();

  const { user } = useUser();

  const [mockData, setMockData] = useState<
    typeof import("../../constants/mockData")
  >();

  useEffect(() => {
    if (mock && !mockData) {
      import("../../constants/mockData").then((data) => {
        setMockData(data);
      });
    }
  }, [mock, mockData, setMockData]);

  const [
    searchPerformanceByLoad,
    { data: dataPerformanceByLoad, error: errorPerformanceByLoad },
  ] = usePerformanceLoadAdvicesMutation();
  const [
    searchDirectTakeCourses,
    { data: dataDirectTakeCourses, error: errorDirectTakeCourses },
  ] = useDirectTakeCoursesMutation();
  const [
    searchIndirectTakeCourses,
    { data: dataIndirectTakeCourses, error: errorIndirectTakeCourses },
  ] = useIndirectTakeCoursesMutation();

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
  ] = useSearchProgramMutation();

  const [
    searchStudent,
    {
      data: searchStudentData,
      loading: searchStudentLoading,
      error: searchStudentError,
    },
  ] = useSearchStudentMutation();

  useUpdateEffect(() => {
    if (IS_NOT_TEST && user?.admin) {
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
  }, [user, mock]);

  useEffect(() => {
    setTrackingData({
      curriculum: chosenCurriculum,
    });
  }, [chosenCurriculum]);

  useEffect(() => {
    if (searchStudentData?.student) {
      setMock(false);
      setTrackingData({
        student: searchStudentData.student.id,
      });
      DashboardInputActions.setStudent(searchStudentData.student.id);
    } else {
      setTrackingData({
        student: undefined,
      });
      DashboardInputActions.setStudent(undefined);
    }
  }, [searchStudentData]);

  useEffect(() => {
    if (searchProgramData?.program) {
      DashboardInputActions.setProgram(searchProgramData.program.id);
      setTrackingData({
        showingProgress: true,
        program: searchProgramData.program.id,
      });
      setMock(false);
    } else {
      DashboardInputActions.setProgram(undefined);
      setTrackingData({
        showingProgress: false,
        program: undefined,
      });
    }
  }, [searchProgramData]);

  useEffect(() => {
    if (user?.type === UserType.Student) {
      searchProgram();
      searchStudent();
      searchPerformanceByLoad();
      searchDirectTakeCourses();
      searchIndirectTakeCourses();
    }
  }, [user, searchProgram, searchStudent, searchPerformanceByLoad]);

  const isPersistenceLoading = useIsPersistenceLoading();

  useEffect(() => {
    if (!mock || !mockData || isPersistenceLoading) return;

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
          requisites.every((requisiteCourseCode) => {
            return allApprovedCourses[requisiteCourseCode] || false;
          })
        ) {
          acum.push(code);
        }
        return acum;
      }, [])
    );

    const requisitesUnmetObj = allCoursesOfProgram.reduce<
      {
        course: string;
        requisitesUnmet: string[];
      }[]
    >((acum, { code, requisites }) => {
      if (
        requisites.some((requisiteCourseCode) => {
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
    }, []);

    ForeplanHelperStore.actions.setIndirectTakeCoursesRequisites(
      requisitesUnmetObj
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

    if (user?.config.FOREPLAN_COURSE_STATS) {
      if (user?.config.FOREPLAN_COURSE_EFFORT_STATS) {
        ForeplanHelperStore.actions.setEffortData(
          allCodes.map((code) => {
            return { code, effort: random(1, 5) };
          })
        );
      }

      if (user?.config.FOREPLAN_COURSE_FAIL_RATE_STATS) {
        ForeplanHelperStore.actions.setFailRateData(
          allCodes.map((code) => {
            return { code, failRate: Math.random() };
          })
        );
      }
    }
  }, [mock, mockData, user, isPersistenceLoading]);

  useEffect(() => {
    if (mock) return;

    if (dataPerformanceByLoad?.performanceLoadAdvices) {
      ForeplanHelperStore.actions.setForeplanAdvices(
        dataPerformanceByLoad.performanceLoadAdvices
      );
    }
  }, [mock, dataPerformanceByLoad]);

  useEffect(() => {
    if (mock) return;

    if (dataDirectTakeCourses?.directTakeCourses) {
      ForeplanHelperStore.actions.setDirectTakeData(
        dataDirectTakeCourses.directTakeCourses.map(({ code }) => code)
      );
    }
  }, [mock, dataDirectTakeCourses]);

  useEffect(() => {
    if (mock) return;

    if (!isPersistenceLoading && dataIndirectTakeCourses?.indirectTakeCourses) {
      const indirectTakesCoursesList = dataIndirectTakeCourses.indirectTakeCourses.map(
        ({ course: { code }, requisitesUnmet }) => {
          return {
            course: code,
            requisitesUnmet,
          };
        }
      );

      ForeplanHelperStore.actions.setIndirectTakeCoursesRequisites(
        indirectTakesCoursesList
      );
    }
  }, [mock, dataIndirectTakeCourses, isPersistenceLoading]);

  useEffect(() => {
    if (mock) return;

    if (
      !isPersistenceLoading &&
      !dataPerformanceByLoad &&
      !dataDirectTakeCourses &&
      !dataIndirectTakeCourses
    ) {
      ForeplanActiveStore.actions.disableForeplan();
      ForeplanHelperStore.actions.setForeplanAdvices([]);
    }
  }, [
    user,
    isPersistenceLoading,
    dataPerformanceByLoad,
    dataDirectTakeCourses,
    dataIndirectTakeCourses,
    mock,
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
            const semesters = curriculumSemesters.map((va) => {
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
    FEEDBACK_ENABLED,
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
  }, [user]);

  const onlyProgramSearch =
    !!searchProgramData?.program && !searchStudentData?.student;

  const searchResult = useMemo(() => {
    return {
      curriculums:
        searchProgramData?.program?.curriculums?.map(({ id }) => {
          return id;
        }) ?? [],
      student:
        user?.type === UserType.Director
          ? searchStudentData?.student?.id
          : user?.student_id,
      program_id: searchProgramData?.program?.id,
      program_name: searchProgramData?.program?.name,
    };
  }, [searchProgramData, searchStudentData, user]);

  const searchError = useMemo(() => {
    return uniq(
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
      .trim();
  }, [
    searchProgramError,
    searchStudentError,
    errorPerformanceByLoad,
    errorDirectTakeCourses,
  ]);

  const onSearchFn = useCallback(
    async ({ student_id, program_id }) => {
      try {
        if (student_id) {
          if (user?.config.FOREPLAN) {
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
    },
    [
      searchPerformanceByLoad,
      searchDirectTakeCourses,
      searchIndirectTakeCourses,
      searchProgram,
      searchStudent,
    ]
  );
  const showsForeplanSummaryTab = ForeplanActiveStore.hooks.useAnyForeplanCourses();

  return (
    <>
      {user?.type === UserType.Director ? (
        <SearchBar
          error={searchError}
          searchResult={searchResult}
          isSearchLoading={searchProgramLoading || searchStudentLoading}
          onSearch={onSearchFn}
        />
      ) : (
        <>
          {searchProgramLoading || searchStudentLoading ? (
            <LoadingPage />
          ) : (
            <SearchBar
              onSearch={onSearchFn}
              isSearchLoading={false}
              searchResult={searchResult}
            />
          )}
        </>
      )}

      <Flex
        pos={onlyProgramSearch ? "relative" : "absolute"}
        width="100%"
        justifyContent="flex-end"
      >
        <DarkMode mr={showsForeplanSummaryTab ? "30px" : undefined} p={2} />
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

      {FEEDBACK_ENABLED && user?.config.FEEDBACK && <Feedback />}

      {user?.config.FOREPLAN && <ForeplanContextManager />}

      <CoursesDashbordManager
        distinct={`${chosenCurriculum}${program}${mock}`}
      />
    </>
  );
};

const IndexPage = () => {
  const { loading, user } = useUser({
    requireAuth: true,
  });

  const toast = useToast();

  const hasUser = Boolean(user);

  useEffect(() => {
    if (hasUser && user) {
      setTimeout(() => {
        toast({
          status: "success",
          title: `${user.name} - ${user.email}`,
          position: "bottom-right",
          duration: 5000,
        });
      }, 500);
    }
  }, [hasUser]);

  if (loading && !hasUser) {
    return <LoadingPage />;
  }

  return <Dashboard />;
};

export default IndexPage;
