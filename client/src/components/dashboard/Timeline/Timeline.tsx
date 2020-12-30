import { AnimatePresence, motion } from "framer-motion";
import { last, round, toInteger } from "lodash";
import React, {
  cloneElement,
  FC,
  memo,
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import pixelWidth from "string-pixel-width";

import { useColorModeValue } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { AxisLeft, AxisScale } from "@vx/axis";

import { ConfigContext } from "../../../context/Config";
import {
  checkExplicitSemesterCallback,
  CoursesDashboardStore,
} from "../../../context/CoursesDashboard";
import { GradeScale, YAxisScale } from "./TimelineHelpers";

const TimeLineTooltip: FC<{
  children: ReactElement;
  grade: number;
}> = ({ children, grade }) => {
  const { TIMELINE_TOOLTIP_TEXT_COLOR } = useContext(ConfigContext);

  const gradeString = grade.toFixed(2);

  const [show, setShow] = useState(false);
  const rectWidth = useMemo(() => {
    return pixelWidth(gradeString, { size: 15.5 }) + 1;
  }, [grade]);
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

  const textColor = useColorModeValue(TIMELINE_TOOLTIP_TEXT_COLOR, "white");

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
              x={(children.props?.cx ?? children.props?.x ?? 0) + 11}
              y={(children.props?.cy ?? children.props?.y ?? 0) - 5}
              fill={textColor}
            >
              {gradeString}
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

const transitionCSS = css`
  transition: "all 0.4s ease-in-out";
`;

const xTranslateMultiplier = 72.7;
const xTranslateAdded = 70;

export const TimeLine: FC<{
  cumulatedGrades: number[];
  semestralGrades: number[];
  programGrades: number[];
  semestersTaken: { year: number; term: string }[];
}> = memo(
  ({
    cumulatedGrades: cumulatedGradesProp,
    semestralGrades: semestralGradesProp,
    programGrades,
    semestersTaken,
  }) => {
    const config = useContext(ConfigContext);
    const explicitSemester = CoursesDashboardStore.hooks.useExplicitSemester();
    const checkExplicitSemester = useCallback(
      checkExplicitSemesterCallback(explicitSemester),
      [explicitSemester]
    );

    const { cumulatedGrades, semestralGrades } = useMemo(() => {
      if (
        toInteger(last(cumulatedGradesProp)) === 0 &&
        toInteger(last(semestralGradesProp)) === 0
      ) {
        return {
          cumulatedGrades: cumulatedGradesProp
            .slice(0, -1)
            .map((n) => round(n, 2)),
          semestralGrades: semestralGradesProp
            .slice(0, -1)
            .map((n) => round(n, 2)),
        };
      }
      return {
        cumulatedGrades: cumulatedGradesProp.map((n) => round(n, 2)),
        semestralGrades: semestralGradesProp.map((n) => round(n, 2)),
      };
    }, [cumulatedGradesProp, semestralGradesProp]);

    const width = Math.max((cumulatedGrades.length - 1) * 120 + 60, 650);

    const CirclesComponent = useMemo(
      () =>
        cumulatedGrades.map((CUMULATED_GRADE, key) => {
          return (
            <g key={key}>
              <TimeLineTooltip grade={CUMULATED_GRADE}>
                <circle
                  cy={GradeScale(CUMULATED_GRADE)}
                  cx={key * xTranslateMultiplier + xTranslateAdded}
                  r={5}
                  fill={config.CUMULATED_GRADE_COLOR}
                  css={transitionCSS}
                />
              </TimeLineTooltip>
              <TimeLineTooltip grade={programGrades[key]}>
                <circle
                  cy={GradeScale(programGrades[key])}
                  cx={key * xTranslateMultiplier + xTranslateAdded}
                  r={5}
                  fill={config.PROGRAM_GRADE_COLOR}
                  css={transitionCSS}
                />
              </TimeLineTooltip>
              {semestralGrades[key] ? (
                <TimeLineTooltip grade={semestralGrades[key]}>
                  <circle
                    cy={GradeScale(semestralGrades[key])}
                    cx={key * xTranslateMultiplier + xTranslateAdded}
                    r={5}
                    fill={
                      checkExplicitSemester({
                        term: semestersTaken[key].term,
                        year: semestersTaken[key].year,
                      })
                        ? config.TIMELINE_EXPLICIT_CIRCLE_COLOR
                        : config.SEMESTRAL_GRADE_COLOR
                    }
                    css={transitionCSS}
                  />
                </TimeLineTooltip>
              ) : null}
            </g>
          );
        }),
      [
        checkExplicitSemester,
        semestralGrades,
        cumulatedGrades,
        programGrades,
        semestersTaken,
        config,
      ]
    );

    const StrokesComponent = useMemo(
      () =>
        cumulatedGrades.map((_, key) => {
          const nextSemestralGrade = semestralGrades
            .slice(key + 1)
            .find((semestralGrade) => Boolean(semestralGrade));
          const nextSemestralGradeKey = semestralGrades
            .slice(key + 1)
            .findIndex((semestralGrade) => Boolean(semestralGrade));

          const currentSemestralGrade = semestralGrades[key];

          return (
            <g key={key}>
              {!!(nextSemestralGrade && currentSemestralGrade) && (
                <line
                  stroke={config.SEMESTRAL_GRADE_COLOR}
                  x1={key * xTranslateMultiplier + xTranslateAdded}
                  y1={GradeScale(currentSemestralGrade)}
                  x2={
                    (nextSemestralGradeKey + key + 1) * xTranslateMultiplier +
                    70
                  }
                  y2={GradeScale(nextSemestralGrade)}
                  css={transitionCSS}
                />
              )}
              {cumulatedGrades[key + 1] !== undefined && (
                <line
                  stroke={config.CUMULATED_GRADE_COLOR}
                  x1={key * xTranslateMultiplier + xTranslateAdded}
                  y1={GradeScale(cumulatedGrades[key])}
                  x2={(key + 1) * xTranslateMultiplier + xTranslateAdded}
                  y2={GradeScale(cumulatedGrades[key + 1])}
                  css={transitionCSS}
                />
              )}
              {cumulatedGrades[key + 1] !== undefined &&
                programGrades[key + 1] !== undefined && (
                  <line
                    stroke={config.PROGRAM_GRADE_COLOR}
                    x1={key * xTranslateMultiplier + xTranslateAdded}
                    y1={GradeScale(programGrades[key])}
                    x2={(key + 1) * xTranslateMultiplier + xTranslateAdded}
                    y2={GradeScale(programGrades[key + 1])}
                    css={transitionCSS}
                  />
                )}
            </g>
          );
        }),
      [semestralGrades, cumulatedGrades, programGrades, config]
    );

    const textColor = useColorModeValue("black", "white");

    const timelineAxisColor = useColorModeValue(
      config.TIMELINE_AXIS_COLOR,
      "white"
    );

    const passLineColor = useColorModeValue(
      config.TIMELINE_PASS_LINE_COLOR,
      "white"
    );

    const LabelAxisComponent = useMemo(
      () => (
        <>
          <text
            y={20}
            x={10}
            fontSize="1em"
            fontWeight="bold"
            fill={textColor}
            css={transitionCSS}
          >
            {config.GRADES_SCALES}
          </text>
          <AxisLeft
            scale={YAxisScale as AxisScale}
            left={40}
            top={40}
            hideAxisLine={false}
            tickLength={4}
            numTicks={5}
            stroke={timelineAxisColor}
            tickStroke={timelineAxisColor}
            tickLabelProps={() => ({
              dx: "-0.25em",
              dy: "0.25em",
              fontSize: 10,
              textAnchor: "end",
              fill: config.TIMELINE_AXIS_TEXT_COLOR,
            })}
          />
          <line
            x1={39}
            y1={170}
            x2={cumulatedGrades.length * 100 + 160}
            y2={40 + 130}
            stroke={timelineAxisColor}
            css={transitionCSS}
          />
          <line
            x1={39}
            y1={GradeScale(config.PASS_GRADE)}
            x2={cumulatedGrades.length * 100 + 160}
            y2={GradeScale(config.PASS_GRADE)}
            stroke={passLineColor}
            strokeDasharray="2"
            css={transitionCSS}
          />

          <circle
            cx={150}
            cy={12}
            r={5}
            fill={config.SEMESTRAL_GRADE_COLOR}
            css={transitionCSS}
          />

          <text x={160} y={20} fill={textColor} css={transitionCSS}>
            {config.SEMESTRAL_GRADE_LABEL}
          </text>
          <circle
            cx={250}
            cy={12}
            r={5}
            fill={config.CUMULATED_GRADE_COLOR}
            css={transitionCSS}
          />
          <text x={260} y={20} fill={textColor} css={transitionCSS}>
            {config.CUMULATED_GRADE_LABEL}
          </text>
          <circle
            cx={350}
            cy={12}
            r={5}
            fill={config.PROGRAM_GRADE_COLOR}
            css={transitionCSS}
          />
          <text x={360} y={20} fill={textColor} css={transitionCSS}>
            {config.PROGRAM_GRADE_LABEL}
          </text>
        </>
      ),
      [cumulatedGrades, config, textColor]
    );
    const height = 270;
    const scale = 0.7;

    const svgCSS = css`
      tspan {
        fill: ${textColor};
      }
    `;

    const viewBox = useMemo(() => `0 0 ${width * scale} ${height * scale}`, [
      width,
      height,
      scale,
    ]);
    return (
      <svg width={width} height={height} viewBox={viewBox} css={svgCSS}>
        {LabelAxisComponent}
        {StrokesComponent}
        {CirclesComponent}
      </svg>
    );
  }
);
