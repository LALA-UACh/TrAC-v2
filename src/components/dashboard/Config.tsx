import { createContext, FC } from "react";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";

import { baseConfig } from "../../../constants";
import { CONFIG_QUERY } from "../../graphql/queries";
import { failColorScale, passColorScale } from "./CourseBox";
import { scaleAxisX, scaleColorX } from "./Histogram";
import { GradeScale, YAxisScale } from "./Timeline";

export const ConfigContext = createContext(baseConfig);

export const Config: FC = ({ children }) => {
  const [configState, setConfigState] = useRememberState(
    "baseConfig",
    baseConfig
  );

  useQuery(CONFIG_QUERY, {
    onCompleted: ({ config }) => {
      setConfigState(config);
    },
  });

  passColorScale
    .range([configState.MIN_PASS_SCALE_COLOR, configState.MAX_PASS_SCALE_COLOR])
    .domain([configState.PASS_GRADE, configState.MAX_GRADE]);
  failColorScale
    .range([configState.MIN_FAIL_SCALE_COLOR, configState.MAX_FAIL_SCALE_COLOR])
    .domain([configState.MIN_GRADE, configState.PASS_GRADE]);
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

  return (
    <ConfigContext.Provider value={configState}>
      {children}
    </ConfigContext.Provider>
  );
};
