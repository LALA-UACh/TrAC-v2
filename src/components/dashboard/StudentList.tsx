import { sortBy, truncate } from "lodash";
import { FC, useEffect, useRef, useState } from "react";
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
  Text,
  useDisclosure,
} from "@chakra-ui/core";

import { CURRENT_USER } from "../../graphql/queries";

export const StudentList: FC<{
  data: {
    student_id: string;
    dropout_probability: number;
    start_year: number;
    progress: number;
  }[];
}> = ({ data: studentListData }) => {
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

  const [columnSort, setColumnSort] = useRememberState<string | null>(
    "student_list_column_sort",
    null
  );

  const [directionSort, setDirectionSort] = useRememberState<
    "ascending" | "descending" | undefined
  >("student_list_direction_sort", undefined);

  const [sortedStudentList, setSortedStudentList] = useState(() =>
    sortBy(studentListData, "student_id")
  );

  const handleSort = (clickedColumn: string) => () => {
    if (columnSort !== clickedColumn) {
      setColumnSort(clickedColumn);
      setDirectionSort("ascending");
    } else {
      setDirectionSort(
        directionSort === "ascending" ? "descending" : "ascending"
      );
    }
  };

  useEffect(() => {
    if (columnSort) {
      const newSortedStudentList = sortBy(studentListData, [
        columnSort,
        "student_list",
        "start_year",
        "progress",
      ]);
      if (directionSort === "descending") {
        newSortedStudentList.reverse();
      }

      setSortedStudentList(newSortedStudentList);
    }
  }, [setSortedStudentList, studentListData, columnSort, directionSort]);

  if (currentUserData?.currentUser?.user?.show_user_list) {
    return (
      <>
        <Button m={2} ref={btnRef} variantColor="blue" onClick={onOpen}>
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
            <DrawerHeader>Lista de estudiantes</DrawerHeader>

            <DrawerBody overflowY="scroll">
              <Table sortable celled fixed>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell
                      width={6}
                      sorted={
                        columnSort === "student" ? directionSort : undefined
                      }
                      onClick={handleSort("student")}
                    >
                      Estudiante
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      width={3}
                      sorted={columnSort === "year" ? directionSort : undefined}
                      onClick={handleSort("year")}
                    >
                      Año
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      width={5}
                      sorted={
                        columnSort === "progress" ? directionSort : undefined
                      }
                      onClick={handleSort("progress")}
                    >
                      Progreso
                    </Table.HeaderCell>
                    {currentUserData?.currentUser?.user?.show_dropout && (
                      <Table.HeaderCell
                        sorted={
                          columnSort === "dropout" ? directionSort : undefined
                        }
                        onClick={handleSort("dropout")}
                        width={2}
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
                            <Text>{truncate(student_id, { length: 23 })}</Text>
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
                          {currentUserData?.currentUser?.user?.show_dropout && (
                            <Table.Cell>
                              <Text
                                color={color}
                              >{`${dropout_probability}%`}</Text>
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
  }

  return null;
};
