import { createContext, createElement, FC, useEffect, useState } from "react";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";

import { NODE_ENV } from "../../constants";
import { baseConfig } from "../../constants/baseConfig";
import {
  failColorScale,
  passColorScale,
} from "../components/dashboard/CourseBox";
import { scaleAxisX, scaleColorX } from "../components/dashboard/Histogram";
import { GradeScale, YAxisScale } from "../components/dashboard/Timeline";
import {
  failRateColorScaleNegative,
  failRateColorScalePositive,
} from "../components/foreplan/courseBox/Stats";
import { CONFIG_QUERY } from "../graphql/queries";

export const ConfigContext = createContext(baseConfig);

export const Config: FC = ({ children }) => {
  const [configState, setConfigState] =
    NODE_ENV === "development"
      ? useState(baseConfig)
      : useRememberState("baseConfig", baseConfig);

  const { data, loading } = useQuery(CONFIG_QUERY);

  useEffect(() => {
    if (!loading && data) {
      setConfigState({ ...baseConfig, ...data.config });
    }
  }, [data, loading]);

  passColorScale
    .range([configState.MIN_PASS_SCALE_COLOR, configState.MAX_PASS_SCALE_COLOR])
    .domain([configState.PASS_GRADE, configState.MAX_GRADE]);
  failColorScale
    .range([configState.MIN_FAIL_SCALE_COLOR, configState.MAX_FAIL_SCALE_COLOR])
    .domain([configState.MIN_GRADE, configState.PASS_GRADE]);

  failRateColorScalePositive
    .range([
      configState.FAIL_RATE_COLOR_SCALE_POSITIVE_MIN_COLOR,
      configState.FAIL_RATE_COLOR_SCALE_POSITIVE_MAX_COLOR,
    ])
    .domain([0, 0.3]);
  failRateColorScaleNegative
    .range([
      configState.FAIL_RATE_COLOR_SCALE_NEGATIVE_MIN_COLOR,
      configState.FAIL_RATE_COLOR_SCALE_NEGATIVE_MAX_COLOR,
    ])
    .domain([0.3, 1]);

  scaleColorX
    .range([0, 250])
    .domain([configState.MIN_GRADE, configState.MAX_GRADE]);
  scaleAxisX
    .range([configState.MIN_GRADE, 250])
    .domain([configState.MIN_GRADE, configState.MAX_GRADE]);
  GradeScale.range([40, 170]).domain([
    configState.MAX_GRADE,
    configState.MIN_GRADE,
  ]);
  YAxisScale.range([0, 130]).domain([
    configState.MAX_GRADE,
    configState.MIN_GRADE,
  ]);

  return createElement(ConfigContext.Provider, {
    value: configState,
    children,
  });
};
