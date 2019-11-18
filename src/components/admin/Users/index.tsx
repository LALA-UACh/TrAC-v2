import _ from "lodash";
import { FunctionComponent, useEffect } from "react";
import { Button, Grid, Icon, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import Confirm from "@components/Confirm";
import Loader from "@components/Loader";

import ImportUsers from "./importUsers";
import UpdateUser from "./updateUser";

const sortKeys = (obj: IUsers): IUsers =>
  _.map(obj, ({ email, name, locked, tries, type, id, show_dropout }) => ({
    email,
    name,
    locked,
    tries,
    type,
    id,
    show_dropout
  }));

const Users: FunctionComponent = () => {
  const [column, setColumn] = useRememberState("TracAdminUsersColumn", "");
  const [direction, setDirection] = useRememberState(
    "TracAdminUsersDirection",
    "ascending" as "ascending" | "descending"
  );

  const [sortedUsers, setSortedUsers] = useRememberState(
    "TracAdminSortedUsers",
    [] as IUsers
  );

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (!_.isEmpty(users))
      if (direction === "ascending") {
        setSortedUsers(sortKeys(_.sortBy(users, [column])));
      } else {
        setSortedUsers(sortKeys(_.sortBy(users, [column])).reverse());
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

  return (
    <Grid>
      <Loader active={loading} />
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
            {_.map(sortedUsers, (value, key) => (
              <UpdateUser key={key} user={value}>
                <Table.Row style={{ cursor: "pointer" }}>
                  {_.map(value, (v, k) => {
                    switch (k) {
                      case "locked":
                        return (
                          <Table.Cell key={k}>
                            {v ? (
                              <Icon circular name="lock" />
                            ) : (
                              <Icon circular name="lock open" />
                            )}
                          </Table.Cell>
                        );
                      case "show_dropout":
                        return (
                          <Table.Cell key={k}>
                            {v ? (
                              <Icon circular name="check circle outline" />
                            ) : (
                              <Icon circular name="times circle outline" />
                            )}
                          </Table.Cell>
                        );
                      case "admin":
                        return null;
                      default:
                        return <Table.Cell key={k}>{v}</Table.Cell>;
                    }
                  })}
                </Table.Row>
              </UpdateUser>
            ))}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};

export default Users;
