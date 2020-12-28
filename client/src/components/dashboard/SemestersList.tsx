import React, { FC, memo, useCallback, useContext, useMemo } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useWindowSize } from "react-use";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  FixedSizeList as ListWindow,
  ListChildComponentProps,
} from "react-window";

import { Stack } from "@chakra-ui/react";

import { ICourse } from "../../../../interfaces";
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

  const SemestersComponent = useMemo(() => {
    return semesters.map(({ n, courses }) => (
      <Semester
        position="absolute"
        left={190 * (n - 1)}
        top={0}
        width={190}
        courses={courses}
        key={n}
        n={n}
        zIndex={semesters.length - n}
      />
    ));
  }, [semesters]);

  const Column = useCallback<FC<ListChildComponentProps>>(
    memo(({ index }) => {
      return SemestersComponent[index];
    }),
    [semesters]
  );

  if (isMobile) {
    return (
      <AutoSizer>
        {({ width }) => {
          return (
            <ListWindow
              layout="horizontal"
              height="90vh"
              width={width}
              itemSize={190}
              itemCount={semesters.length}
              overscanCount={1}
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
