import { chunk, some, sortBy, toInteger, truncate, uniq } from "lodash";
import React, {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaListOl } from "react-icons/fa";
import { useUpdateEffect } from "react-use";
import { Pagination, Progress, Table, TableCell } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/core";
import { css } from "@emotion/core";

import { NODE_ENV } from "../../../constants";
import { ConfigContext } from "../../context/Config";
import { track } from "../../context/Tracking";
import { STUDENT_LIST } from "../../graphql/queries";
import { marginZero, textAlignCenter } from "../../utils/cssConstants";
import { useUser } from "../../utils/useUser";

const progressTextShadow = css`
  .progress {
    text-shadow: 1px 0.5px 1px black !important;
  }
`;

const progressSmallText = css`
  .progress {
    font-size: 10px !important;
  }
`;

const TableHeader: FC<{
  columnSort: columnNames[];
  directionSort: "ascending" | "descending" | undefined;
  handleSort: (clickedColumn: columnNames) => () => void;
  showDropout: boolean;
}> = memo(({ columnSort, directionSort, handleSort, showDropout }) => {
  const {
    STUDENT_LABEL,
    ENTRY_YEAR_LABEL,
    PROGRESS_LABEL,
    RISK_LABEL,
  } = useContext(ConfigContext);

  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell width={2} />
        <Table.HeaderCell
          width={4}
          sorted={columnSort[0] === "student_id" ? directionSort : undefined}
          onClick={handleSort("student_id")}
        >
          {STUDENT_LABEL}
        </Table.HeaderCell>
        <Table.HeaderCell
          width={2}
          sorted={columnSort[0] === "start_year" ? directionSort : undefined}
          onClick={handleSort("start_year")}
        >
          {ENTRY_YEAR_LABEL}
        </Table.HeaderCell>
        <Table.HeaderCell
          width={5}
          sorted={columnSort[0] === "progress" ? directionSort : undefined}
          onClick={handleSort("progress")}
        >
          {PROGRESS_LABEL}
        </Table.HeaderCell>
        {showDropout && (
          <Table.HeaderCell
            sorted={
              columnSort[0] === "dropout_probability"
                ? directionSort
                : undefined
            }
            onClick={handleSort("dropout_probability")}
            width={4}
          >
            {RISK_LABEL}
          </Table.HeaderCell>
        )}
      </Table.Row>
    </Table.Header>
  );
});

const nStudentPerChunk = 25;

const initialOpen = (() => {
  if (NODE_ENV === "development" && typeof window !== "undefined") {
    return !!localStorage.getItem("student_list_open");
  }

  return false;
})();

export type columnNames = keyof StudentListInfo;

export type StudentListInfo = {
  student_id: string;
  dropout_probability: number;
  start_year: number;
  explanation: string;
  progress: number;
};

export const StudentList: FC<{
  mockData?: StudentListInfo[];
  program_id?: string;
  searchStudent: (student: string) => Promise<void>;
}> = ({ mockData, program_id, searchStudent }) => {
  const { data: dataStudentList, loading: loadingData } = useQuery(
    STUDENT_LIST,
    {
      variables: {
        program_id,
      },
      skip: !program_id,
    }
  );

  const studentListData = useMemo(() => {
    return (
      mockData ||
      (dataStudentList?.students.map(
        ({ id, start_year, progress, dropout }) => {
          return {
            student_id: id,
            dropout_probability: dropout?.prob_dropout ?? -1,
            progress: progress * 100,
            start_year,
            explanation: dropout?.explanation ?? "",
          };
        }
      ) ??
        [])
    );
  }, [dataStudentList, mockData]);

  const { user } = useUser();

  const { isOpen, onOpen, onClose } = useDisclosure(initialOpen);

  useUpdateEffect(() => {
    track({
      action: "click",
      effect: isOpen ? "open-student-list" : "close-student-list",
      target: isOpen ? "student-list-button" : "outside-student-list",
    });
  }, [isOpen]);

  if (NODE_ENV === "development") {
    useUpdateEffect(() => {
      if (isOpen) {
        localStorage.setItem("student_list_open", "1");
      } else {
        localStorage.removeItem("student_list_open");
      }
    }, [isOpen]);
  }

  const btnRef = useRef<HTMLElement>(null);

  const [columnSort, setColumnSort] = useRememberState<columnNames[]>(
    "student_list_columns_sort",
    ["student_id", "start_year", "dropout_probability", "dropout_probability"]
  );

  const [directionSort, setDirectionSort] = useRememberState<
    "ascending" | "descending" | undefined
  >("student_list_direction_sort", undefined);

  const [sortedStudentList, setSortedStudentList] = useState(() =>
    sortBy(studentListData, columnSort)
  );

  useEffect(() => {
    const newSortedStudentList = sortBy(studentListData, columnSort);
    if (directionSort === "descending") {
      newSortedStudentList.reverse();
    }
    setSortedStudentList(newSortedStudentList);
  }, [studentListData, directionSort, columnSort, setSortedStudentList]);

  const [pageSelected, setPageSelected] = useRememberState(
    "student_list_page_selected",
    1
  );

  useUpdateEffect(() => {
    track({
      action: "click",
      target: "student-list-header-sort",
      effect: `sort-student-list-by-${columnSort.join("|")}-${directionSort}`,
    });
  }, [directionSort, columnSort]);

  const [studentListChunks, setStudentListChunks] = useState(() =>
    chunk(sortedStudentList, nStudentPerChunk)
  );

  useEffect(() => {
    if (pageSelected > studentListChunks.length) {
      setPageSelected(1);
    }
  }, [studentListChunks, pageSelected]);

  useEffect(() => {
    setStudentListChunks(chunk(sortedStudentList, nStudentPerChunk));
  }, [sortedStudentList, setStudentListChunks]);

  const showDropout = useMemo(() => {
    return (
      !!user?.config?.SHOW_DROPOUT &&
      some(studentListData, ({ dropout_probability }) => {
        return (dropout_probability ?? -1) !== -1;
      })
    );
  }, [user, studentListData]);

  const {
    STUDENT_LIST_TITLE,
    RISK_HIGH_COLOR,
    RISK_HIGH_THRESHOLD,
    RISK_MEDIUM_COLOR,
    RISK_MEDIUM_THRESHOLD,
    RISK_LOW_COLOR,
    CHECK_STUDENT_FROM_LIST_LABEL,
  } = useContext(ConfigContext);

  const handleSort = useCallback(
    (clickedColumn: columnNames) => () => {
      if (columnSort[0] !== clickedColumn) {
        setColumnSort((columnSortList) =>
          uniq([clickedColumn, ...columnSortList])
        );
        setDirectionSort("ascending");
      } else {
        setDirectionSort(
          directionSort === "ascending" ? "descending" : "ascending"
        );
      }
    },
    [columnSort, directionSort]
  );

  const selectedStudents = useMemo(() => {
    return studentListChunks[pageSelected - 1];
  }, [studentListChunks, pageSelected]);

  return (
    <>
      <Button
        isLoading={loadingData}
        m={2}
        ref={btnRef}
        variantColor="blue"
        onClick={onOpen}
        cursor="pointer"
        leftIcon={FaListOl}
        fontFamily="Lato"
      >
        {STUDENT_LIST_TITLE}
      </Button>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="xl"
        scrollBehavior="inside"
        isFullHeight
        preserveScrollBarGap
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton background="white" />
          <DrawerHeader height={20} display="flex" alignItems="center">
            {STUDENT_LIST_TITLE} {loadingData && <Spinner ml={3} />}
          </DrawerHeader>

          <DrawerBody>
            <Stack alignItems="center">
              <Pagination
                css={textAlignCenter}
                totalPages={studentListChunks.length}
                activePage={pageSelected}
                onPageChange={(_, { activePage }) => {
                  track({
                    action: "click",
                    target: `student-list-pagination`,
                    effect: `set-student-list-page-to-${activePage}`,
                  });
                  setPageSelected(toInteger(activePage));
                }}
              />

              <Table sortable celled fixed>
                <TableHeader
                  columnSort={columnSort}
                  directionSort={directionSort}
                  handleSort={handleSort}
                  showDropout={showDropout}
                />
                <Table.Body>
                  {selectedStudents?.map(
                    (
                      {
                        student_id,
                        dropout_probability,
                        start_year,
                        progress,
                        explanation,
                      },
                      key
                    ) => {
                      let color: string;
                      if (dropout_probability > RISK_HIGH_THRESHOLD) {
                        color = RISK_HIGH_COLOR;
                      } else if (dropout_probability > RISK_MEDIUM_THRESHOLD) {
                        color = RISK_MEDIUM_COLOR;
                      } else {
                        color = RISK_LOW_COLOR;
                      }
                      const integerProgress = toInteger(progress);
                      const checkStudentLabel = `${CHECK_STUDENT_FROM_LIST_LABEL} ${student_id}`;
                      return (
                        <Table.Row key={key} verticalAlign="middle">
                          <TableCell textAlign="center">
                            {1 + key + (pageSelected - 1) * nStudentPerChunk}
                          </TableCell>
                          <Table.Cell
                            className="cursorPointer"
                            onClick={() => {
                              searchStudent(student_id);
                              onClose();
                            }}
                          >
                            <Tooltip
                              aria-label={checkStudentLabel}
                              label={checkStudentLabel}
                              zIndex={10000}
                              placement="top"
                              textAlign="center"
                            >
                              <Text>
                                {truncate(student_id, { length: 16 })}
                              </Text>
                            </Tooltip>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{start_year}</Text>
                          </Table.Cell>
                          <Table.Cell verticalAlign="middle">
                            <Progress
                              css={[
                                marginZero,
                                progressTextShadow,
                                integerProgress >= 10 &&
                                  integerProgress < 20 &&
                                  progressSmallText,
                              ]}
                              progress
                              percent={integerProgress}
                            />
                          </Table.Cell>
                          {showDropout && (
                            <Table.Cell>
                              <Stack
                                isInline
                                shouldWrapChildren
                                alignItems="center"
                              >
                                <Text
                                  margin={0}
                                  textShadow="0.5px 0.5px 0px #a1a1a1"
                                  color={
                                    dropout_probability !== -1
                                      ? color
                                      : undefined
                                  }
                                  fontWeight="bold"
                                >
                                  {dropout_probability !== -1
                                    ? `${toInteger(dropout_probability)}`
                                    : "-"}
                                </Text>
                                {explanation ? (
                                  <Popover trigger="hover">
                                    <PopoverTrigger>
                                      <Icon
                                        display="flex"
                                        name="info-outline"
                                        size="13px"
                                        cursor="help"
                                      />
                                    </PopoverTrigger>
                                    <PopoverContent
                                      width="fit-content"
                                      zIndex={100}
                                      padding="5px"
                                    >
                                      <PopoverArrow />
                                      <PopoverBody>
                                        <Text>
                                          {explanation.charAt(0).toUpperCase() +
                                            explanation.slice(1)}
                                        </Text>
                                      </PopoverBody>
                                    </PopoverContent>
                                  </Popover>
                                ) : null}
                              </Stack>
                            </Table.Cell>
                          )}
                        </Table.Row>
                      );
                    }
                  )}
                </Table.Body>
              </Table>
            </Stack>
          </DrawerBody>
          <DrawerFooter justifyContent="flex-start">
            <Icon
              name={isOpen ? "chevron-left" : "chevron-right"}
              size="35px"
              onClick={onClose}
              cursor="pointer"
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default StudentList;
