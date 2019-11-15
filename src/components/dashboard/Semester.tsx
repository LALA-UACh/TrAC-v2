import { FC, useMemo } from "react";

import { Stack, Text } from "@chakra-ui/core";
import { ICourse } from "@interfaces";

import { CourseBox } from "./CourseBox";

const toRoman = (num: number): string => {
  if (num < 1) {
    return "";
  }
  if (num >= 40) {
    return "XL" + toRoman(num - 40);
  }
  if (num >= 10) {
    return "X" + toRoman(num - 10);
  }
  if (num >= 9) {
    return "IX" + toRoman(num - 9);
  }
  if (num >= 5) {
    return "V" + toRoman(num - 5);
  }
  if (num >= 4) {
    return "IV" + toRoman(num - 4);
  }
  if (num >= 1) {
    return "I" + toRoman(num - 1);
  }
  return "";
};

export const Semester: FC<{ semester: ICourse[]; n: number }> = ({
  semester,
  n
}) => {
  return useMemo(
    () => (
      <Stack>
        <Text color="rgb(70,130,180)" textAlign="center" fontSize="1.5em">
          <b>{toRoman(n)}</b>
        </Text>
        {semester.map((course, key) => (
          <CourseBox key={key} {...course} />
        ))}
      </Stack>
    ),
    [semester, n]
  );
};
