import { some } from "lodash";
import { reverse } from "lodash/fp";

import { Box, Stack } from "@chakra-ui/core";
import { RequireAuth } from "@components";
import { CoursesFlow } from "@components/dashboard/CoursesFlow";
import { Dropout } from "@components/dashboard/Dropout";
import { Semester } from "@components/dashboard/Semester";
import { SemesterTakenBox } from "@components/dashboard/SemesterTakenBox";
import { TimeLine } from "@components/dashboard/Timeline";
import { StateCourse } from "@constants";
import data from "@constants/data.json";
import { ICourse, IDistribution, ISemesterTaken } from "@interfaces";
import ScrollContainer from "@pablosz/react-indiana-drag-scroll";

console.log("data", data);
export default () => {
  let semestersTaken: ISemesterTaken[] = data.studentAcademic.terms.map(
    ({ year, semester }) => ({
      year,
      semester
    })
  );
  let semesters: {
    semester: ICourse[];
  }[] = [];
  data.programStructure.terms.map(
    ({
      courses
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
            requisites
          }) => {
            let historicDistribution:
              | IDistribution[]
              | undefined = historicGroup?.distribution.map(
              ({ value, label }) => ({
                value,
                min: parseFloat(label.split("-")[0]),
                max: parseFloat(label.split("-")[1])
              })
            );
            let registration: string | undefined;
            let grade: number | undefined;
            let currentDistributionLabel: string | undefined;
            let currentDistribution: IDistribution[] | undefined;
            let first: boolean = true;
            const historicalStates: {
              state: StateCourse;
              grade: number;
            }[] = [];
            let state: StateCourse | undefined;
            const semestersTaken: { year: number; semester: string }[] = [];

            reverse(data.studentAcademic.terms).forEach(({ coursesTaken }) => {
              for (const {
                code: codeToFind,
                classGroup: { year, semester, distribution },
                registration: registrationToFind,
                grade: gradeToFind,
                state: stateToFind
              } of coursesTaken) {
                let currentDistributionValues = distribution.map(
                  ({ value, label }) => ({
                    value,
                    min: parseFloat(label.split("-")[0]),
                    max: parseFloat(label.split("-")[1])
                  })
                );

                if (codeToFind === code) {
                  if (first) {
                    first = false;
                    registration = registrationToFind;
                    grade = gradeToFind;
                    currentDistributionLabel = `Calificaciones ${semester} ${year}`;
                    state = stateToFind as StateCourse;
                    if (some(currentDistributionValues, ({ value }) => value)) {
                      currentDistribution = currentDistributionValues;
                    }
                  } else {
                    historicalStates.push({
                      state: stateToFind as StateCourse,
                      grade: gradeToFind
                    });
                  }
                  semestersTaken.push({ year, semester });
                }
              }
            });
            return {
              name,
              code,
              credits,
              historicDistribution: some(
                historicDistribution,
                ({ value }) => value
              )
                ? historicDistribution
                : [],
              registration,
              grade,
              currentDistributionLabel,
              currentDistribution,
              historicalStates,
              state,
              flow: flujoMaterias,
              requisites,
              semestersTaken
            };
          }
        )
      });
    }
  );

  return (
    <RequireAuth>
      <CoursesFlow>
        <Box pb={50} width="100vw" backgroundColor="black" />
        <ScrollContainer activationDistance={1}>
          <Stack isInline>
            <Box>
              <TimeLine
                PGA={data.PGA}
                PSP={data.PSP}
                ProgramPGA={data.ProgramPGA}
                semestersTaken={semestersTaken}
              />
            </Box>
            <Dropout
              probability={data.studentAcademic.student_dropout.prob_dropout}
              accuracy={data.studentAcademic.student_dropout.model_accuracy}
            />
          </Stack>

          <Stack isInline pl="50px">
            {semestersTaken.map(({ semester, year }, key) => (
              <SemesterTakenBox key={key} semester={semester} year={year} />
            ))}
          </Stack>
        </ScrollContainer>

        <ScrollContainer
          hideScrollbars={false}
          vertical={false}
          activationDistance={1}
        >
          <Stack isInline spacing={8}>
            {semesters.map(({ semester }, key) => (
              <Semester key={key} semester={semester} n={key + 1} />
            ))}
          </Stack>
        </ScrollContainer>
      </CoursesFlow>
    </RequireAuth>
  );
};
