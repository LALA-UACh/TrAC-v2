import { scaleLinear } from "d3-scale";
import { motion } from "framer-motion";
import toString from "lodash/toString";
import { FC, memo, useCallback, useMemo } from "react";

import {
  HISTOGRAM_BAR_ACTIVE,
  HISTOGRAM_BAR_INACTIVE,
  maxGrade,
  minGrade,
  rangeGrades,
} from "@constants";
import { IDistribution } from "@interfaces";
import { AxisBottom, AxisLeft } from "@vx/axis";

const SingleBar: FC<{
  grey?: boolean;
  x?: number;
  y?: number;
  height?: number;
}> = memo(({ grey, y: propY, height, x }) => {
  const fill = grey ? HISTOGRAM_BAR_ACTIVE : HISTOGRAM_BAR_INACTIVE;
  const y = (propY ?? 0) - (height ?? 0);
  return (
    <motion.rect
      width={40}
      x={x}
      y={y}
      height={height}
      animate={{ fill }}
      transition={{ duration: 1 }}
      fill={fill}
    />
  );
});

const averageTwo = (a: number | undefined, b: number | undefined) => {
  return ((a ?? b ?? 0) + (b ?? a ?? 0)) / 2;
};

const scaleColorX = scaleLinear()
  .range([0, 250])
  .domain([minGrade, maxGrade]);

const scaleAxisX = scaleLinear()
  .range([minGrade, 250])
  .domain([minGrade, maxGrade]);

const AxisColor = rangeGrades.map(({ min, max, color }, key) => {
  const nextMin: number | undefined = rangeGrades[key + 1]?.max;
  const previousMax: number | undefined = rangeGrades[key - 1]?.max;

  let x = scaleColorX(averageTwo(previousMax, min));
  let width =
    scaleColorX(averageTwo(nextMin, max)) -
    scaleColorX(averageTwo(previousMax, min));

  return (
    <rect key={key} x={5 + x} y={80} width={width} height={7} fill={color} />
  );
});

const AxisNumbers = (() => {
  return (
    <AxisBottom
      scale={scaleAxisX}
      left={5}
      top={80}
      hideAxisLine={true}
      hideTicks={true}
      tickLength={4}
      numTicks={5}
      tickFormat={(n: number) => {
        if (toString(n).slice(-2) === ".0") {
          return toString(n).slice(0, -2);
        }
        return n;
      }}
    />
  );
})();

const XAxis: FC = () => {
  return (
    <>
      {AxisColor}
      {AxisNumbers}
    </>
  );
};

export const Histogram: FC<{
  distribution: IDistribution[];
  label?: string;
  grade?: number;
}> = memo(({ distribution, label, grade }) => {
  const barsScale = useCallback(
    scaleLinear()
      .domain([0, Math.max(...distribution.map(({ value }) => value))])
      .range([0, 70]),
    [distribution]
  );
  const axisLeftScale = useCallback(
    scaleLinear()
      .range([0, 70])
      .domain([Math.max(...distribution.map(({ value }) => value)), 0]),
    [distribution]
  );

  const greyN = useMemo(() => {
    if (grade !== undefined) {
      const findGrade = (
        { min, max }: { min: number; max: number },
        key: number
      ) => {
        if (grade >= min && grade <= max) {
          if (grade === max && distribution[key + 1]) {
            return false;
          }
          return true;
        }
        return false;
      };
      const n = distribution.findIndex(findGrade);

      if (n === -1) {
        return distribution
          .map((v, key) => {
            let max = v.max;
            let min = v.min;
            const nextMin = distribution[key + 1]?.min;
            const previousMax = distribution[key - 1]?.max;
            if (nextMin) {
              max = (max + nextMin) / 2;
            }
            if (previousMax) {
              min = (min + previousMax) / 2;
            }
            return {
              min,
              max,
            };
          })
          .findIndex(findGrade);
      }
      return n;
    }

    return -1;
  }, [grade, distribution]);

  return (
    <svg width={300} height={130}>
      <svg x={35} y={23}>
        <XAxis />
        {distribution.map(({ value }, key) => (
          <SingleBar
            x={5 + 40 * key + 2 * key}
            y={77}
            key={key}
            grey={key === greyN}
            height={barsScale(value)}
          />
        ))}
      </svg>

      <svg x={0}>
        <text y={20} x={30} fontWeight="bold">
          {label ?? "Undefined"}
        </text>
        <svg x={-5} y={20}>
          <AxisLeft
            left={40}
            top={10}
            scale={axisLeftScale}
            hideAxisLine={true}
            tickLength={4}
            numTicks={4}
          />
        </svg>
      </svg>
    </svg>
  );
});
