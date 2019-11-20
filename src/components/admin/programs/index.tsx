import { sortBy, truncate } from "lodash";
import { FC, useEffect } from "react";
import { Grid, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { ImportPrograms } from "./ImportPrograms";
import { UpdatePrograms } from "./UpdatePrograms";

export const Programs: FC<{
  programs: { email: string; programs: number[] }[];
}> = ({ programs }) => {
  const [column, setColumn] = useRememberState("TracAdminProgramsColumn", "");
  const [direction, setDirection] = useRememberState<"ascending" | "descending">(
    "TracAdminProgramsDirection",
    "ascending"
  );
  const [sortedPrograms, setSortedPrograms] = useRememberState<
    { email: string; programs: number[] }[]
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

  return (
    <Grid>
      <Grid.Row centered>
        <ImportPrograms />
      </Grid.Row>

      <Grid.Row centered>
        <Table
          padded
          selectable
          celled
          size="large"
          style={{ width: "1em" }}
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
            {sortedPrograms.map(({ email, programs }, key) => (
              <UpdatePrograms key={key} program={{ email, programs }}>
                <Table.Row style={{ cursor: "pointer" }}>
                  <Table.Cell>{email}</Table.Cell>
                  <Table.Cell>{truncate(programs.join(" | "), { length: 50 })}</Table.Cell>
                </Table.Row>
              </UpdatePrograms>
            ))}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};
