import { sortBy, truncate } from "lodash";
import React, { FC, useEffect } from "react";
import { Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { Flex, Stack } from "@chakra-ui/core";

import { cursorPointer } from "../../../utils/cssConstants";
import { usePagination } from "../Pagination";
import { ImportPrograms } from "./ImportPrograms";
import { UpdatePrograms } from "./UpdatePrograms";

export const Programs: FC<{
  programs: { email: string; programs: string[] }[];
}> = ({ programs }) => {
  const [column, setColumn] = useRememberState("TracAdminProgramsColumn", "");
  const [direction, setDirection] = useRememberState<
    "ascending" | "descending"
  >("TracAdminProgramsDirection", "ascending");
  const [sortedPrograms, setSortedPrograms] = useRememberState<
    { email: string; programs: string[] }[]
  >("TracAdminSortedPrograms", []);

  useEffect(() => {
    if (direction === "ascending") {
      setSortedPrograms(sortBy(programs, [column]));
    } else {
      setSortedPrograms(sortBy(programs, [column]).reverse());
    }
  }, [programs, column, direction, setSortedPrograms]);

  const handleSort = (clickedColumn: string) => () => {
    if (column !== clickedColumn) {
      setColumn(clickedColumn);
      setDirection("ascending");
    } else {
      setDirection(direction === "ascending" ? "descending" : "ascending");
    }
  };

  const { pagination, selectedData } = usePagination({
    name: "trac_admin_sorted_programs",
    data: sortedPrograms,
    n: 15,
  });

  return (
    <Stack alignItems="center" spacing="1em">
      <Flex>
        <ImportPrograms />
      </Flex>

      <Flex>{pagination}</Flex>

      <Flex>
        <Table
          padded
          selectable
          celled
          size="large"
          textAlign="center"
          sortable
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={column === "email" ? direction : undefined}
                onClick={handleSort("email")}
              >
                email
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "program" ? direction : undefined}
                onClick={handleSort("program")}
              >
                program
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {selectedData.map(({ email = "", programs = [] }, key) => (
              <UpdatePrograms key={key} program={{ email, programs }}>
                <Table.Row css={cursorPointer}>
                  <Table.Cell>{email}</Table.Cell>
                  <Table.Cell>
                    {truncate(programs.join(" | "), { length: 50 })}
                  </Table.Cell>
                </Table.Row>
              </UpdatePrograms>
            ))}
          </Table.Body>
        </Table>
      </Flex>
    </Stack>
  );
};
