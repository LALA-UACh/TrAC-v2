import { sortBy, truncate } from "lodash";
import React, { FC, useEffect, useState } from "react";
import { Button, Grid, Icon, Message, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useMutation } from "@apollo/react-hooks";

import { UserType } from "../../../../constants";
import { MAIL_LOCKED_USERS_ADMIN } from "../../../graphql/adminQueries";
import { Confirm } from "../../Confirm";
import { ImportUsers } from "./ImportUsers";
import { UpdateUser } from "./UpdateUser";

export const Users: FC<{
  users: {
    email: string;
    name: string;
    tries: number;
    type: UserType;
    rut_id?: string;
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
      rut_id?: string;
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

  const [openMailMessage, setOpenMailMessage] = useState(false);

  const [
    mailLockedUsers,
    {
      data: dataMailLockedUsers,
      error: errorMailLockedUsers,
      loading: loadingMailLockedUsers,
    },
  ] = useMutation(MAIL_LOCKED_USERS_ADMIN);

  return (
    <Grid centered>
      <Grid.Row>
        <ImportUsers />
      </Grid.Row>
      <Grid.Row>
        <Grid centered>
          <Grid.Row>
            <Confirm
              header="Are you sure you want to send a new email to all currently locked users?"
              content="It will be given to them a new unlock key in their email"
            >
              <Button
                icon
                labelPosition="left"
                secondary
                onClick={async () => {
                  try {
                    await mailLockedUsers();
                  } catch (err) {
                    console.error(JSON.stringify(err, null, 2));
                  }
                  setOpenMailMessage(true);
                }}
                loading={loadingMailLockedUsers}
                disabled={loadingMailLockedUsers}
              >
                <Icon name="mail" />
                New unlock key to locked users
              </Button>
            </Confirm>
          </Grid.Row>
          {openMailMessage && (
            <Grid.Row>
              <Message
                success={!errorMailLockedUsers ? true : undefined}
                error={!!errorMailLockedUsers ? true : undefined}
                icon
                compact
                size="small"
                style={{ whiteSpace: "pre-line" }}
              >
                <Icon name="close" onClick={() => setOpenMailMessage(false)} />
                <Message.Content>
                  {errorMailLockedUsers && (
                    <Message.Header>Error!</Message.Header>
                  )}
                  {errorMailLockedUsers && errorMailLockedUsers.message}
                  {dataMailLockedUsers &&
                  dataMailLockedUsers.mailAllLockedUsers.length > 0 ? (
                    <Message.List>
                      {dataMailLockedUsers.mailAllLockedUsers.map(
                        (value, key) => {
                          return (
                            <Message.Item style={{ width: "50%" }} key={key}>
                              {JSON.stringify(value, null, 2)}
                            </Message.Item>
                          );
                        }
                      )}
                    </Message.List>
                  ) : (
                    "There are not any locked users"
                  )}
                </Message.Content>
              </Message>
            </Grid.Row>
          )}
        </Grid>
      </Grid.Row>

      <Grid.Row>
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
                sorted={column === "rut_id" ? direction : undefined}
                onClick={handleSort("rut_id")}
              >
                rut_id
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
              (
                { email, name, locked, tries, type, rut_id, show_dropout },
                key
              ) => (
                <UpdateUser
                  key={key}
                  user={{
                    email,
                    name,
                    locked,
                    tries,
                    type,
                    rut_id,
                    show_dropout,
                  }}
                >
                  <Table.Row style={{ cursor: "pointer" }}>
                    <Table.Cell>{email}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>
                      <Icon circular name={locked ? "lock" : "lock open"} />
                    </Table.Cell>
                    <Table.Cell>{tries}</Table.Cell>
                    <Table.Cell>{type}</Table.Cell>
                    <Table.Cell>{truncate(rut_id, { length: 10 })}</Table.Cell>
                    <Table.Cell>
                      <Icon
                        circular
                        name={
                          show_dropout
                            ? "check circle outline"
                            : "times circle outline"
                        }
                      />
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
