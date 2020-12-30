import { some } from "lodash";
import React, { useContext } from "react";

import { ICourse } from "../../../../../interfaces";
import { termTypeToNumber } from "../../../../constants";
import { ConfigContext } from "../../../context/Config";
import {
  currentDistributionLabel,
  CurrentTakenData,
} from "../CourseBox/CourseBox";
import { Histogram } from "./Histogram";

export function HistogramNow({
  currentDistribution,
  term,
  year,
  taken,
  grade,
  bandColors,
}: Pick<ICourse, "taken" | "bandColors"> &
  Pick<CurrentTakenData, "currentDistribution" | "term" | "year" | "grade">) {
  const { GRADES_LABEL: label } = useContext(ConfigContext);

  return (
    (currentDistribution &&
      some(currentDistribution, ({ value }) => value) &&
      term &&
      year && (
        <Histogram
          key="now"
          label={currentDistributionLabel({
            term: termTypeToNumber(term),
            year,
            label,
          })}
          distribution={currentDistribution}
          grade={grade}
          bandColors={taken?.[0]?.bandColors ?? bandColors}
        />
      )) ||
    null
  );
}
