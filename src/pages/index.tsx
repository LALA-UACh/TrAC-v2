import { flatMapDeep, random, sampleSize, uniq } from "lodash";
import dynamic from "next/dynamic";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useUpdateEffect } from "react-use";
import { useRememberState } from "use-remember-state";

import { useMutation } from "@apollo/react-hooks";
import { Box, Flex, Stack } from "@chakra-ui/core";

import {
  PROGRAM_NOT_FOUND,
  PROGRAM_UNAUTHORIZED,
  STUDENT_NOT_FOUND,
  UserType,
} from "../../constants";
import { ITakenCourse } from "../../interfaces";
import { ConfigContext } from "../components/Config";
import { CoursesDashbordManager } from "../components/dashboard/CoursesDashboardContext";
import { Semester } from "../components/dashboard/Semester";
import { TakenSemesterBox } from "../components/dashboard/TakenSemesterBox";
import { TimeLine } from "../components/dashboard/Timeline";
import {
  ForeplanContextManager,
  useForeplanActiveActions,
  useForeplanHelperActions,
} from "../components/foreplan/ForeplanContext";
import { LoadingPage } from "../components/Loading";
import { TrackingManager, useTracking } from "../components/Tracking";
import {
  PERFORMANCE_BY_LOAD_ADVICES,
  SEARCH_PROGRAM,
  SEARCH_STUDENT,
} from "../graphql/queries";
import { useUser } from "../utils/useUser";

const SearchBar = dynamic(() => import("../components/dashboard/SearchBar"));
const Dropout = dynamic(() => import("../components/dashboard/Dropout"));
const ForeplanModeSwitch = dynamic(() =>
  import("../components/foreplan/ForeplanModeSwitch")
);
const ForeplanSummary = dynamic(() => import("../components/foreplan/Summary"));

const Dashboard: FC = () => {
  const [program, setProgram] = useState<string | undefined>(undefined);

  const [chosenCurriculum, setChosenCurriculum] = useState<string | undefined>(
    undefined
  );

  const { user } = useUser();
  const [mock, setMock] = useRememberState("mockMode", !!user?.admin);

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
    } else {
      setTrackingData({
        student: undefined,
      });
    }
  }, [searchStudentData, setTrackingData]);

  useEffect(() => {
    if (searchProgramData?.program) {
      setTrackingData({
        showingProgress: true,
        program: searchProgramData.program.id,
      });
      setMock(false);
    } else {
      setTrackingData({
        showingProgress: false,
        program: undefined,
      });
    }
  }, [searchProgramData, setTrackingData]);

  useEffect(() => {
    if (user?.type === UserType.Student) {
      searchProgram();
      searchStudent();
      searchPerformanceByLoad();
    }
  }, [user, searchProgram, searchStudent, searchPerformanceByLoad]);

  const [, foreplanActiveActions] = useForeplanActiveActions();
  const [, foreplanHelperActions] = useForeplanHelperActions();

  useEffect(() => {
    if (mock) {
      foreplanActiveActions.setForeplanAdvices(
        mockData?.default.performanceByLoad ?? []
      );
      const allCodes = flatMapDeep(
        mockData?.default.searchProgramData.program.curriculums.map(
          ({ semesters }) => {
            return semesters.map(({ courses }) => {
              return courses.map(({ code }) => {
                return code;
              });
            });
          }
        )
      );
      foreplanHelperActions.setDirectTakeData(
        sampleSize(allCodes, allCodes.length / 2)
      );
      foreplanHelperActions.setFailRateData(
        allCodes.map(code => {
          return { code, failRate: Math.random() };
        })
      );
      foreplanHelperActions.setEffortData(
        allCodes.map(code => {
          return { code, effort: random(1, 5) };
        })
      );
    } else {
      if (user?.type !== UserType.Student) {
        foreplanActiveActions.reset();
      }
      if (dataPerformanceByLoad?.performanceLoadAdvices) {
        foreplanActiveActions.setForeplanAdvices(
          dataPerformanceByLoad.performanceLoadAdvices
        );
      } else {
        foreplanActiveActions.disableForeplan();
        foreplanActiveActions.setForeplanAdvices([]);
      }
    }
  }, [
    dataPerformanceByLoad,
    mock,
    user,
    mockData,
    foreplanActiveActions,
    foreplanHelperActions,
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

  return (
    <>
      {user?.type === UserType.Director ? (
        <SearchBar
          error={uniq(
            [
              ...(searchProgramError?.graphQLErrors ?? []),
              ...(searchStudentError?.graphQLErrors ?? []),
              ...(errorPerformanceByLoad?.graphQLErrors ?? []),
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
                student_id
                  ? searchPerformanceByLoad({
                      variables: { student_id, program_id },
                    })
                  : undefined,
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
            <LoadingPage />
          ) : null}
        </>
      )}

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

      <ScrollContainer
        hideScrollbars={false}
        vertical={false}
        activationDistance={5}
      >
        <Stack isInline spacing={8}>
          {SemestersComponent}
        </Stack>
      </ScrollContainer>

      <TrackingManager />

      <ForeplanContextManager />
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

  return <Dashboard />;
};
