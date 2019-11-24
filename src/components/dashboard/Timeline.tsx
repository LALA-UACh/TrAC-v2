import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import {
  cloneElement,
  FC,
  memo,
  ReactElement,
  useContext,
  useMemo,
  useState,
} from "react";
import pixelWidth from "string-pixel-width";

import {
  CUMULATED_GRADE_COLOR,
  CUMULATED_GRADE_LABEL,
  GRADES_SCALES,
  maxGrade,
  minGrade,
  passGrade,
  PROGRAM_GRADE_COLOR,
  PROGRAM_GRADE_LABEL,
  SEMESTRAL_GRADE_COLOR,
  SEMESTRAL_GRADE_LABEL,
  TIMELINE_AXIS_COLOR,
  TIMELINE_AXIS_TEXT_COLOR,
  TIMELINE_EXPLICIT_CIRCLE_COLOR,
  TIMELINE_PASS_LINE_COLOR,
  TIMELINE_TOOLTIP_TEXT_COLOR,
} from "@constants";
import { AxisLeft } from "@vx/axis";

import { CoursesFlowContext } from "./CoursesFlow";

const TimeLineTooltip: FC<{
  children: ReactElement;
  grade: number;
}> = ({ children, grade }) => {
  const [show, setShow] = useState(false);
  const rectWidth = useMemo(
    () => pixelWidth(grade.toString(10), { size: 15.5 }) + 1,
    [grade]
  );
  const Children = useMemo(
    () =>
      cloneElement(children, {
        onMouseOver: () => {
          setShow(true);
        },
        onMouseLeave: () => {
          setShow(false);
        },
      }),
    [children, setShow]
  );

  const Tooltip = useMemo(
    () => (
      <AnimatePresence>
        {show && (
          <motion.g
            key="tooltip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <rect
              x={(children.props?.cx ?? children.props?.x ?? 0) + 9}
              y={(children.props?.cy ?? children.props?.y ?? 0) - 20}
              fill={children.props?.fill}
              width={rectWidth}
              height={20}
              rx={5}
            />
            <text
              x={(children.props?.cx ?? children.props?.x ?? 0) + 10}
              y={(children.props?.cy ?? children.props?.y ?? 0) - 5}
              fill={TIMELINE_TOOLTIP_TEXT_COLOR}
            >
              {grade}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    ),
    [show, grade, children, rectWidth]
  );

  return (
    <g>
      {Children}
      {Tooltip}
    </g>
  );
};

const GradeScale = scaleLinear()
  .range([40, 170])
  .domain([maxGrade, minGrade]);

const YAxisScale = scaleLinear()
  .range([0, 130])
  .domain([maxGrade, minGrade]);

export const TimeLine: FC<{
  CUMULATED_GRADE: number[];
  SEMESTRAL_GRADE: number[];
  PROGRAM_GRADE: number[];
  semestersTaken: { year: number; term: string }[];
}> = memo(
  ({ CUMULATED_GRADE, SEMESTRAL_GRADE, PROGRAM_GRADE, semestersTaken }) => {
    const width = useMemo(
      () => Math.max((CUMULATED_GRADE.length - 1) * 120 + 60, 650),
      [CUMULATED_GRADE]
    );
    const { checkExplicitSemester } = useContext(CoursesFlowContext);

    const CirclesComponent = useMemo(
      () =>
        CUMULATED_GRADE.map((CUMULATED_GRADE, key) => {
          return (
            <g key={key}>
              <TimeLineTooltip grade={CUMULATED_GRADE}>
                <circle
                  cy={GradeScale(CUMULATED_GRADE)}
                  cx={key * 70 + 70}
                  r={5}
                  fill={CUMULATED_GRADE_COLOR}
                />
              </TimeLineTooltip>
              <TimeLineTooltip grade={PROGRAM_GRADE[key]}>
                <circle
                  cy={GradeScale(PROGRAM_GRADE[key])}
                  cx={key * 70 + 70}
                  r={5}
                  fill={PROGRAM_GRADE_COLOR}
                />
              </TimeLineTooltip>
              <TimeLineTooltip grade={SEMESTRAL_GRADE[key]}>
                <circle
                  cy={GradeScale(SEMESTRAL_GRADE[key])}
                  cx={key * 70 + 70}
                  r={5}
                  fill={
                    checkExplicitSemester({
                      term: semestersTaken[key].term,
                      year: semestersTaken[key].year,
                    })
                      ? TIMELINE_EXPLICIT_CIRCLE_COLOR
                      : SEMESTRAL_GRADE_COLOR
                  }
                  style={{ transition: "0.4s all ease-in-out" }}
                />
              </TimeLineTooltip>
            </g>
          );
        }),
      [
        SEMESTRAL_GRADE,
        CUMULATED_GRADE,
        PROGRAM_GRADE,
        semestersTaken,
        checkExplicitSemester,
      ]
    );

    const StrokesComponent = useMemo(
      () =>
        CUMULATED_GRADE.map((_, key) => {
          return (
            <g key={key}>
              {SEMESTRAL_GRADE[key + 1] !== undefined && (
                <line
                  stroke={SEMESTRAL_GRADE_COLOR}
                  x1={key * 70 + 70}
                  y1={GradeScale(SEMESTRAL_GRADE[key])}
                  x2={(key + 1) * 70 + 70}
                  y2={GradeScale(SEMESTRAL_GRADE[key + 1])}
                />
              )}
              {CUMULATED_GRADE[key + 1] !== undefined && (
                <line
                  stroke={CUMULATED_GRADE_COLOR}
                  x1={key * 70 + 70}
                  y1={GradeScale(CUMULATED_GRADE[key])}
                  x2={(key + 1) * 70 + 70}
                  y2={GradeScale(CUMULATED_GRADE[key + 1])}
                />
              )}
              {PROGRAM_GRADE[key + 1] !== undefined && (
                <line
                  stroke={PROGRAM_GRADE_COLOR}
                  x1={key * 70 + 70}
                  y1={GradeScale(PROGRAM_GRADE[key])}
                  x2={(key + 1) * 70 + 70}
                  y2={GradeScale(PROGRAM_GRADE[key + 1])}
                />
              )}
            </g>
          );
        }),
      [SEMESTRAL_GRADE, CUMULATED_GRADE, PROGRAM_GRADE]
    );

    const LabelAxisComponent = useMemo(
      () => (
        <>
          <text y={20} x={10} fontSize="1em" fontWeight="bold">
            {GRADES_SCALES}
          </text>
          <AxisLeft
            scale={YAxisScale}
            left={40}
            top={40}
            hideAxisLine={false}
            tickLength={4}
            numTicks={5}
            stroke={TIMELINE_AXIS_COLOR}
            tickStroke={TIMELINE_AXIS_COLOR}
            tickLabelProps={() => ({
              dx: "-0.25em",
              dy: "0.25em",
              fontSize: 10,
              textAnchor: "end",
              fill: TIMELINE_AXIS_TEXT_COLOR,
            })}
          />
          <line
            x1={39}
            y1={170}
            x2={CUMULATED_GRADE.length * 100 + 160}
            y2={40 + 130}
            stroke={TIMELINE_AXIS_COLOR}
          />
          <line
            x1={39}
            y1={GradeScale(passGrade)}
            x2={340}
            y2={GradeScale(passGrade)}
            stroke={TIMELINE_PASS_LINE_COLOR}
            strokeDasharray="2"
          />

          <circle cx={150} cy={12} r={5} fill={SEMESTRAL_GRADE_COLOR} />

          <text x={160} y={20}>
            {SEMESTRAL_GRADE_LABEL}
          </text>
          <circle cx={250} cy={12} r={5} fill={CUMULATED_GRADE_COLOR} />
          <text x={260} y={20}>
            {CUMULATED_GRADE_LABEL}
          </text>
          <circle cx={350} cy={12} r={5} fill={PROGRAM_GRADE_COLOR} />
          <text x={360} y={20}>
            {PROGRAM_GRADE_LABEL}
          </text>
        </>
      ),
      [CUMULATED_GRADE]
    );
    const height = 270;
    const scale = 0.7;

    const viewBox = useMemo(() => `0 0 ${width * scale} ${height * scale}`, [
      width,
      height,
      scale,
    ]);
    return (
      <svg width={width} height={height} viewBox={viewBox}>
        {LabelAxisComponent}
        {StrokesComponent}
        {CirclesComponent}
      </svg>
    );
  }
);
