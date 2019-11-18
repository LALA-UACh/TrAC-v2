import _ from "lodash";
import { FunctionComponent, useEffect } from "react";
import { Grid, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import Loader from "@components/Loader";

import ImportPrograms from "./importPrograms";
import UpdateProgram from "./updateProgram";

const sortKeys = (obj: IPrograms): IPrograms =>
  _.map(obj, ({ email, program }) => ({
    email,
    program
  }));

const Programs: FunctionComponent = () => {
  const [column, setColumn] = useRememberState("TracAdminProgramsColumn", "");
  const [direction, setDirection] = useRememberState(
    "TracAdminProgramsDirection",
    "ascending" as "ascending" | "descending"
  );
  const [sortedPrograms, setSortedPrograms] = useRememberState(
    "TracAdminSortedPrograms",
    [] as IPrograms
  );
  -useEffect(() => {
    getPrograms();
  }, []);

  useEffect(() => {
    if (!_.isEmpty(programs))
      if (direction === "ascending") {
        setSortedPrograms(sortKeys(_.sortBy(programs, [column])));
      } else {
        setSortedPrograms(sortKeys(_.sortBy(programs, [column])).reverse());
      }
  }, [programs, column, direction]);

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
      <Loader active={loading} />
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
            {_.map(sortedPrograms, (value, key) => (
              <UpdateProgram key={key} program={value}>
                <Table.Row style={{ cursor: "pointer" }}>
                  {_.map(value, (v, k) => {
                    return <Table.Cell key={k}>{v}</Table.Cell>;
                  })}
                </Table.Row>
              </UpdateProgram>
            ))}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};

export default Programs;
