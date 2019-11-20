import { sortBy } from "lodash";
import { FC, useEffect } from "react";
import { Button, Grid, Icon, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { Confirm } from "@components/Confirm";
import { UserType } from "@constants";

import { ImportUsers } from "./ImportUsers";
import { UpdateUser } from "./UpdateUser";

export const Users: FC<{
  users: {
    email: string;
    name: string;
    tries: number;
    type: UserType;
    id?: string;
    show_dropout: boolean;
    locked: boolean;
  }[];
}> = ({ users }) => {
  const [column, setColumn] = useRememberState("TracAdminUsersColumn", "");
  const [direction, setDirection] = useRememberState(
    "TracAdminUsersDirection",
    "ascending" as "ascending" | "descending"
  );

  const [sortedUsers, setSortedUsers] = useRememberState<
    {
      email: string;
      name: string;
      tries: number;
      type: UserType;
      id?: string;
      show_dropout: boolean;
      locked: boolean;
    }[]
  >("TracAdminSortedUsers", []);

  useEffect(() => {
    if (users.length > 0)
      if (direction === "ascending") {
        setSortedUsers(sortBy(users, [column]));
      } else {
        setSortedUsers(sortBy(users, [column]).reverse());
      }
  }, [users, column, direction]);

  const handleSort = (clickedColumn: string) => () => {
    if (column !== clickedColumn) {
      setColumn(clickedColumn);
      setDirection("ascending");
    } else {
      setDirection(direction === "ascending" ? "descending" : "ascending");
    }
  };

  const mailLockedUsers = () => {};
  // TODO: mailLockedUsers mutation

  return (
    <Grid>
      <Grid.Row centered>
        <ImportUsers />
      </Grid.Row>
      <Grid.Row centered>
        <Confirm
          header="¿Está seguro que desea enviar un nuevo correo electrónico a todos los usuarios bloqueados?"
          content="Se les va a asignar un nuevo código de activación en conjunto con el correo enviado a todos los usuarios bloqueados"
        >
          <Button
            icon
            labelPosition="left"
            secondary
            onClick={() => mailLockedUsers()}
          >
            <Icon name="mail" />
            Código nuevo a usuarios bloqueados
          </Button>
        </Confirm>
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
                sorted={column === "name" ? direction : undefined}
                onClick={handleSort("name")}
              >
                name
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "locked" ? direction : undefined}
                onClick={handleSort("locked")}
              >
                locked
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "tries" ? direction : undefined}
                onClick={handleSort("tries")}
              >
                tries
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "type" ? direction : undefined}
                onClick={handleSort("type")}
              >
                type
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "id" ? direction : undefined}
                onClick={handleSort("id")}
              >
                id
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "show_dropout" ? direction : undefined}
                onClick={handleSort("show_dropout")}
              >
                show_dropout
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {sortedUsers.map(
              ({ email, name, locked, tries, type, id, show_dropout }, key) => (
                <UpdateUser
                  key={key}
                  user={{ email, name, locked, tries, type, id, show_dropout }}
                >
                  <Table.Row style={{ cursor: "pointer" }}>
                    <Table.Cell>{email}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>
                      {locked ? (
                        <Icon circular name="lock" />
                      ) : (
                        <Icon circular name="lock open" />
                      )}
                    </Table.Cell>
                    <Table.Cell>{tries}</Table.Cell>
                    <Table.Cell>{type}</Table.Cell>
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>
                      {show_dropout ? (
                        <Icon circular name="check circle outline" />
                      ) : (
                        <Icon circular name="times circle outline" />
                      )}
                    </Table.Cell>
                  </Table.Row>
                </UpdateUser>
              )
            )}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};
