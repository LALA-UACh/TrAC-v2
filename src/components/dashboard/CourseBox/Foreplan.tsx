import classNames from "classnames";
import { motion } from "framer-motion";
import { range } from "lodash";
import React, { FC, memo } from "react";
import { Checkbox } from "semantic-ui-react";

import { ICourse } from "../../../../interfaces";
import { useUser } from "../../../utils/useUser";
import {
  useForeplanCourseEffort,
  useForeplanCourseFailRate,
  useForeplanIsDirectTake,
  useIsForeplanCourseChecked,
} from "../../foreplan/ForeplanContext";
import { failRateColorScaleNegative, failRateColorScalePositive } from "./";
import styles from "./index.module.css";

export const ForeplanCourseStats: FC<Pick<ICourse, "code">> = memo(
  ({ code }) => {
    const [failRate] = useForeplanCourseFailRate({ code });
    const [effort] = useForeplanCourseEffort({ code });
    const fillColor =
      failRate >= 0.3
        ? ((failRateColorScaleNegative(failRate) as unknown) as string)
        : ((failRateColorScalePositive(failRate) as unknown) as string);

    const { user } = useUser();

    return (
      <motion.div
        key="foreplanCourseStats"
        initial={{
          opacity: 0,
        }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
        }}
        className={styles.foreplanCourseStats}
      >
        {user?.config.FOREPLAN_COURSE_FAIL_RATE_STATS && (
          <svg height="10px" width="10px">
            <rect width="10px" height="10px" fill={fillColor} />
          </svg>
        )}

        {user?.config.FOREPLAN_COURSE_EFFORT_STATS && (
          <svg
            className={styles.foreplanCourseEffortStats}
            height="10px"
            width="20px"
          >
            {range(0, effort).map(i => {
              //TODO: Use real data
              return (
                <rect
                  key={i}
                  height="10px"
                  width="1px"
                  x={i * 3}
                  y={0}
                  fill="black"
                />
              );
            })}
          </svg>
        )}
      </motion.div>
    );
  }
);

export const ForeplanCourseCheckbox: FC<Pick<
  ICourse,
  "code" | "credits" | "name"
>> = memo(({ code, credits, name }) => {
  const [
    checked,
    { addCourseForeplan, removeCourseForeplan },
  ] = useIsForeplanCourseChecked({ code });
  const [directTake] = useForeplanIsDirectTake({ code });
  return (
    <motion.div
      key="foreplanCourseCheckbox"
      initial={{
        opacity: 0,
      }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
      }}
      className={styles.foreplanCourseCheckbox}
    >
      <Checkbox
        checked={checked}
        onChange={ev => {
          ev.preventDefault();
          ev.stopPropagation();
          if (checked) {
            removeCourseForeplan(code);
          } else {
            addCourseForeplan(code, {
              credits: credits?.[0]?.value ?? 0,
              name,
            });
          }
        }}
        className={classNames({
          [styles.foreplanCheckboxInput]: true,
          [directTake ? styles.direct : styles.indirect]: true, //TODO: Use real data
        })}
      />
    </motion.div>
  );
});
