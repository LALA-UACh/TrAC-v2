import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { cloneElement, FC, memo, ReactElement, useContext, useMemo, useState } from "react";
import pixelWidth from "string-pixel-width";

import { GRADES_SCALES, PROGRAM_PGA } from "@constants";
import { approvedGrade, maxGrade, minGrade, PGA_COLOR, PROGRAM_PGA_COLOR, PSP_COLOR } from "@temp";
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
        }
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
              fill="rgb(255,255,255)"
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

export const TimeLine: FC<{
  PGA: number[];
  PSP: number[];
  ProgramPGA: number[];
  semestersTaken: { year: number; semester: string }[];
}> = memo(({ PGA, PSP, ProgramPGA, semestersTaken }) => {
  const width = useMemo(() => Math.max((PGA.length - 1) * 120 + 60, 650), [
    PGA
  ]);
  const height = 270;
  const scale = 0.7;
  const { explicitSemester } = useContext(CoursesFlowContext);

  const GradeScale = useMemo(
    () =>
      scaleLinear()
        .range([40, 170])
        .domain([maxGrade, minGrade]),
    [maxGrade, minGrade]
  );

  const CirclesComponent = useMemo(
    () =>
      PGA.map((PGAGrade, key) => {
        return (
          <g key={key}>
            <TimeLineTooltip grade={PGAGrade}>
              <circle
                cy={GradeScale(PGAGrade)}
                cx={key * 70 + 70}
                r={5}
                fill={PGA_COLOR}
              />
            </TimeLineTooltip>
            <TimeLineTooltip grade={ProgramPGA[key]}>
              <circle
                cy={GradeScale(ProgramPGA[key])}
                cx={key * 70 + 70}
                r={5}
                fill={PROGRAM_PGA_COLOR}
              />
            </TimeLineTooltip>
            <TimeLineTooltip grade={PSP[key]}>
              <circle
                cy={GradeScale(PSP[key])}
                cx={key * 70 + 70}
                r={5}
                fill={
                  `${semestersTaken[key].semester}${semestersTaken[key].year}` ===
                  explicitSemester
                    ? "rgb(236,201,75)"
                    : PSP_COLOR
                }
                style={{ transition: "0.4s all ease-in-out" }}
              />
            </TimeLineTooltip>
          </g>
        );
      }),
    [
      PSP,
      PGA,
      ProgramPGA,
      semestersTaken,
      explicitSemester,
      PSP_COLOR,
      PGA_COLOR,
      GradeScale
    ]
  );

  const StrokesComponent = useMemo(
    () =>
      PGA.map((_, key) => {
        return (
          <g key={key}>
            {PSP[key + 1] !== undefined && (
              <line
                stroke={PSP_COLOR}
                x1={key * 70 + 70}
                y1={GradeScale(PSP[key])}
                x2={(key + 1) * 70 + 70}
                y2={GradeScale(PSP[key + 1])}
              />
            )}
            {PGA[key + 1] !== undefined && (
              <line
                stroke={PGA_COLOR}
                x1={key * 70 + 70}
                y1={GradeScale(PGA[key])}
                x2={(key + 1) * 70 + 70}
                y2={GradeScale(PGA[key + 1])}
              />
            )}
            {ProgramPGA[key + 1] !== undefined && (
              <line
                stroke={PROGRAM_PGA_COLOR}
                x1={key * 70 + 70}
                y1={GradeScale(ProgramPGA[key])}
                x2={(key + 1) * 70 + 70}
                y2={GradeScale(ProgramPGA[key + 1])}
              />
            )}
          </g>
        );
      }),
    [PSP, PGA, ProgramPGA, PSP_COLOR, GradeScale, PROGRAM_PGA_COLOR]
  );

  const YAxisScale = useMemo(
    () =>
      scaleLinear()
        .range([0, 130])
        .domain([maxGrade, minGrade]),
    [maxGrade, minGrade]
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
        />
        <line
          x1={39}
          y1={170}
          x2={PGA.length * 100 + 160}
          y2={40 + 130}
          stroke="black"
        />
        <line
          x1={39}
          y1={GradeScale(approvedGrade)}
          x2={340}
          y2={GradeScale(approvedGrade)}
          stroke="black"
          strokeDasharray="2"
        />

        <circle cx={150} cy={12} r={5} fill={PSP_COLOR} />

        <text x={160} y={20}>
          PSP
        </text>
        <circle cx={250} cy={12} r={5} fill={PGA_COLOR} />
        <text x={260} y={20}>
          PGA
        </text>
        <circle cx={350} cy={12} r={5} fill={PROGRAM_PGA_COLOR} />
        <text x={360} y={20}>
          {PROGRAM_PGA}
        </text>
      </>
    ),
    [
      PROGRAM_PGA,
      PROGRAM_PGA_COLOR,
      PGA_COLOR,
      PSP_COLOR,
      GradeScale,
      approvedGrade,
      YAxisScale,
      GRADES_SCALES
    ]
  );
  const viewBox = useMemo(() => `0 0 ${width * scale} ${height * scale}`, [
    width,
    height,
    scale
  ]);
  return (
    <svg width={width} height={height} viewBox={viewBox}>
      {LabelAxisComponent}
      {StrokesComponent}
      {CirclesComponent}
    </svg>
  );
});
