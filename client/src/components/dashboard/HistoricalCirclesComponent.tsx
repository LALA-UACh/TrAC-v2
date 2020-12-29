import React, { useContext, useMemo } from "react";
import { Stack } from "@chakra-ui/react";
import { StateCourse } from "../../../constants";
import { ConfigContext } from "../../context/Config";
import { ForeplanActiveStore } from "../../context/ForeplanContext";
import { ICourse } from "../../../../interfaces";
import { HistoricalCircle } from "./HistoricalCircle";
import { failColorScale } from "./CourseBox";

export function HistoricalCirclesComponent({
  taken,
  isOpen,
}: Pick<ICourse, "taken"> & { isOpen: boolean }) {
  const config = useContext(ConfigContext);
  const isForeplanActive = ForeplanActiveStore.hooks.useIsForeplanActive();

  const StateHistoryArray = useMemo(() => {
    if (
      !isOpen &&
      isForeplanActive &&
      taken[0]?.state === StateCourse.Current
    ) {
      return taken.slice(1, 2);
    }
    return taken.slice(1);
  }, [isOpen, isForeplanActive, taken]);

  return (
    <Stack spacing={0.7} alignItems="center">
      {StateHistoryArray.map(({ state, grade }, key) => {
        let color: string;
        let tooltipType: "error" | "info" | "light";
        let tooltipLabel: number | string | undefined = grade;
        switch (state) {
          case StateCourse.Failed:
            tooltipType = "error";
            color = (failColorScale(grade || 0) as unknown) as string;
            if (!tooltipLabel) {
              tooltipLabel = config.STATE_FAILED_LABEL_MINI;
            }
            break;
          case StateCourse.Current:
            tooltipType = "info";
            color = config.STATE_COURSE_CURRENT_COLOR;
            break;
          case StateCourse.Canceled:
            tooltipLabel = config.CANCELED_HISTORIC_TOOLTIP_LABEL;
            tooltipType = "light";
            color = config.STATE_COURSE_CANCELED_COLOR;
            break;
          default:
            return null;
        }
        return (
          <HistoricalCircle
            key={key}
            color={color}
            tooltipLabel={tooltipLabel}
            tooltipType={tooltipType}
          />
        );
      })}
    </Stack>
  );
}
