import classNames from "classnames";
import { motion } from "framer-motion";
import React, { FC, memo } from "react";
import { Checkbox } from "semantic-ui-react";

import { ICourse } from "../../../../interfaces";
import {
  useForeplanIsDirectTake,
  useIsForeplanCourseChecked,
} from "../../../context/ForeplanContext";
import styles from "./foreplanCourseBox.module.css";

const ForeplanCourseCheckbox: FC<Pick<
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
      className={styles.courseCheckbox}
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
          [styles.checkboxInput]: true,
          [directTake ? styles.direct : styles.indirect]: true,
        })}
      />
    </motion.div>
  );
});

export default ForeplanCourseCheckbox;
