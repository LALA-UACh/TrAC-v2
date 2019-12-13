import { some, sortBy, truncate, uniq } from "lodash";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";
import { useUpdateEffect } from "react-use";
import { Progress, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/core";

import { CURRENT_USER, STUDENT_LIST } from "../../graphql/queries";

type columnNames =
  | "student_id"
  | "dropout_probability"
  | "start_year"
  | "progress";

export const StudentList: FC<{
  mockData?: Record<columnNames, string | number>[];
  program_id?: string;
}> = ({ mockData, program_id }) => {
  const { data: dataStudentList, loading: loadingData } = useQuery(
    STUDENT_LIST,
    {
      variables: {
        program_id,
      },
      skip: !program_id,
    }
  );

  const studentListData = useMemo<
    Record<columnNames, string | number>[]
  >(() => {
    return (
      mockData ||
      (dataStudentList?.students.map(
        ({ id, start_year, progress, dropout }) => {
          return {
            student_id: id,
            dropout_probability: dropout?.prob_dropout ?? -1,
            progress: progress * 100,
            start_year,
          };
        }
      ) ??
        [])
    );
  }, [dataStudentList, mockData]);

  const { data: currentUserData } = useQuery(CURRENT_USER, {
    fetchPolicy: "cache-only",
  });

  const { isOpen, onOpen, onClose } = useDisclosure(
    localStorage.getItem("student_list_open") ? true : false
  );
  useUpdateEffect(() => {
    if (isOpen) {
      localStorage.setItem("student_list_open", "1");
    } else {
      localStorage.removeItem("student_list_open");
    }
  }, [isOpen]);
  const btnRef = useRef<HTMLElement>(null);

  const [columnSort, setColumnSort] = useRememberState<columnNames[]>(
    "student_list_columns_sort",
    ["student_id", "start_year", "dropout_probability", "dropout_probability"]
  );

  const [directionSort, setDirectionSort] = useRememberState<
    "ascending" | "descending" | undefined
  >("student_list_direction_sort", undefined);

  const [isSorting, setIsSorting] = useState(false);
  const [sortedStudentList, setSortedStudentList] = useState(
    sortBy(studentListData, columnSort)
  );

  useEffect(() => {
    setIsSorting(true);
    setTimeout(() => {
      const newSortedStudentList = sortBy(studentListData, columnSort);
      if (directionSort === "descending") {
        newSortedStudentList.reverse();
      }
      setIsSorting(false);
      setSortedStudentList(newSortedStudentList);
    }, 0);
  }, [
    studentListData,
    directionSort,
    columnSort,
    setIsSorting,
    setSortedStudentList,
  ]);

  const showDropout = useMemo(() => {
    return (
      !!currentUserData?.currentUser?.user?.show_dropout &&
      some(studentListData, ({ dropout_probability }) => {
        return (dropout_probability ?? -1) !== -1;
      })
    );
  }, [currentUserData, studentListData]);

  const handleSort = (clickedColumn: columnNames) => () => {
    setIsSorting(true);
    if (columnSort[0] !== clickedColumn) {
      setColumnSort(columnSortList => uniq([clickedColumn, ...columnSortList]));
      setDirectionSort("ascending");
    } else {
      setDirectionSort(
        directionSort === "ascending" ? "descending" : "ascending"
      );
    }
  };

  const isLoading = loadingData || isSorting;
  return (
    <>
      <Button
        isLoading={isLoading}
        m={2}
        ref={btnRef}
        variantColor="blue"
        onClick={onOpen}
      >
        Student List
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader height={20} display="flex" alignItems="center">
            Lista de estudiantes {isLoading && <Spinner ml={3} />}
          </DrawerHeader>

          <DrawerBody overflowY="scroll">
            <Table sortable celled fixed>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell
                    width={5}
                    sorted={
                      columnSort[0] === "student_id" ? directionSort : undefined
                    }
                    onClick={handleSort("student_id")}
                  >
                    Estudiante
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={3}
                    sorted={
                      columnSort[0] === "start_year" ? directionSort : undefined
                    }
                    onClick={handleSort("start_year")}
                  >
                    Ingreso
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width={5}
                    sorted={
                      columnSort[0] === "progress" ? directionSort : undefined
                    }
                    onClick={handleSort("progress")}
                  >
                    Progreso
                  </Table.HeaderCell>
                  {showDropout && (
                    <Table.HeaderCell
                      sorted={
                        columnSort[0] === "dropout_probability"
                          ? directionSort
                          : undefined
                      }
                      onClick={handleSort("dropout_probability")}
                      width={3}
                    >
                      Riesgo
                    </Table.HeaderCell>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedStudentList.map(
                  (
                    { student_id, dropout_probability, start_year, progress },
                    key
                  ) => {
                    let color: string;
                    if (dropout_probability > 80) {
                      color = "rgb(255,0,0)";
                    } else if (dropout_probability > 50) {
                      color = "rgb(252,186,3)";
                    } else {
                      color = "rgb(128,255,0)";
                    }
                    return (
                      <Table.Row key={student_id} verticalAlign="middle">
                        <Table.Cell>
                          <ReactTooltip id={`student_list_${key}`} />
                          <Text>
                            {truncate(student_id.toString(), { length: 18 })}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{start_year}</Text>
                        </Table.Cell>
                        <Table.Cell verticalAlign="middle">
                          <Progress
                            style={{ margin: 0 }}
                            percent={progress}
                            data-tip={`${progress}%`}
                            data-for={`student_list_${key}`}
                          />
                        </Table.Cell>
                        {showDropout && (
                          <Table.Cell>
                            <Text
                              color={
                                dropout_probability !== -1 ? color : undefined
                              }
                            >
                              {dropout_probability !== -1
                                ? `${dropout_probability}%`
                                : "-"}
                            </Text>
                          </Table.Cell>
                        )}
                      </Table.Row>
                    );
                  }
                )}
              </Table.Body>
            </Table>
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
