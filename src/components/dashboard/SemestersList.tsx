import React, { FC, memo, useContext } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useWindowSize } from "react-use";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  FixedSizeList as ListWindow,
  ListChildComponentProps,
} from "react-window";

import { Stack } from "@chakra-ui/core";

import { ICourse } from "../../../interfaces";
import { ConfigContext } from "../../context/Config";
import { Semester } from "./Semester";

export const SemestersList: FC<{
  semesters: { n: number; courses: ICourse[] }[];
}> = memo(({ semesters }) => {
  const { width } = useWindowSize();
  const { DASHBOARD_SEMESTERS_LIST_MOBILE_BREAKPOINT } = useContext(
    ConfigContext
  );
  const isMobile = width < DASHBOARD_SEMESTERS_LIST_MOBILE_BREAKPOINT;

  if (isMobile) {
    const Column: FC<ListChildComponentProps> = ({ index, style }) => {
      return (
        <Semester
          style={{ ...style, zIndex: semesters.length - index }}
          courses={semesters[index].courses}
          n={semesters[index].n}
        />
      );
    };
    return (
      <AutoSizer>
        {({ height, width }) => {
          return (
            <ListWindow
              layout="horizontal"
              height={height}
              width={width}
              itemSize={190}
              itemCount={semesters.length}
            >
              {Column}
            </ListWindow>
          );
        }}
      </AutoSizer>
    );
  }
  return (
    <ScrollContainer
      hideScrollbars={false}
      vertical={false}
      activationDistance={5}
    >
      <Stack isInline spacing={8}>
        {semesters.map(({ courses, n }, key) => {
          return <Semester key={key} courses={courses} n={n} />;
        })}
      </Stack>
    </ScrollContainer>
  );
});
