import { some } from "lodash";
import React, { useContext } from "react";

import { Badge } from "@chakra-ui/react";

import { ICourse } from "../../../../../interfaces";
import { ConfigContext } from "../../../context/Config";
import { CurrentTakenData } from "../CourseBox/CourseBox";
import { Histogram } from "./Histogram";

export function HistogramHistoric({
  historicDistribution,
  bandColors,
  grade,
}: Pick<ICourse, "historicDistribution" | "bandColors"> &
  Pick<CurrentTakenData, "grade">) {
  const config = useContext(ConfigContext);
  return historicDistribution &&
    some(historicDistribution, ({ value }) => value) ? (
    <Histogram
      key="historic"
      label={config.HISTORIC_GRADES}
      distribution={historicDistribution}
      grade={grade}
      bandColors={bandColors}
    />
  ) : (
    <Badge>{config.NO_HISTORIC_DATA}</Badge>
  );
}
