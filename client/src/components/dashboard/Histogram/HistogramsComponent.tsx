import classNames from "classnames";
import { motion } from "framer-motion";
import React, { ReactNode } from "react";

import { ICourse } from "../../../../../interfaces";
import { ForeplanActiveStore } from "../../../context/ForeplanContext";
import { CurrentTakenData } from "../CourseBox/CourseBox";
import styles from "./Histogram.module.css";

export function HistogramsComponent({
  children,
  state,
  code,
}: Pick<CurrentTakenData, "state"> &
  Pick<ICourse, "code"> & { children: ReactNode }) {
  const isPossibleToTake = ForeplanActiveStore.hooks.useIsPossibleToTakeForeplan(
    { state, course: code },
    [state, code]
  );
  return (
    <motion.div
      key="histograms"
      initial={{
        opacity: 0,
        scale: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
        position: "static",
      }}
      exit={{
        opacity: 0,
        scale: 0.4,
        position: "absolute",
      }}
      className={classNames({
        [styles.histogramBox]: true,
        [styles.foreplanActive]: isPossibleToTake,
      })}
    >
      {children}
    </motion.div>
  );
}
