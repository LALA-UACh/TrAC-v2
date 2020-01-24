import { sortBy, truncate } from "lodash";
import React, { FC, useEffect, useState } from "react";
import { Button, Grid, Icon, Message, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useMutation } from "@apollo/react-hooks";

import { UserType } from "../../../../constants";
import { UserConfig } from "../../../../constants/userConfig";
import { MAIL_LOCKED_USERS_ADMIN } from "../../../graphql/adminQueries";
import { Confirm } from "../../Confirm";
import { usePagination } from "../Pagination";
import { ImportUsers } from "./ImportUsers";
import { UpdateUser } from "./UpdateUser";

export const Users: FC<{
  users: {
    email: string;
    name: string;
    tries: number;
    type: UserType;
    student_id?: string;
    config: UserConfig;
    locked: boolean;
  }[];
}> = ({ users }) => {
  const [column, setColumn] = useRememberState("TracAdminUsersColumn", "");
  const [direction, setDirection] = useRememberState(
    "TracAdminUsersDirection",
    "ascending" as "ascending" | "descending"
  );

  const [sortedUsers, setSortedUsers] = useRememberState<typeof users>(
    "TracAdminSortedUsers",
    []
  );

  useEffect(() => {
    if (users.length > 0)
      if (direction === "ascending") {
        setSortedUsers(sortBy(users, [column]));
      } else {
        setSortedUsers(sortBy(users, [column]).reverse());
      }
  }, [users, column, direction, setSortedUsers]);

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

  const { pagination, selectedData } = usePagination({
    name: "admin_sorted_users",
    data: sortedUsers,
    n: 15,
  });

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

      <Grid.Row>{pagination}</Grid.Row>

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
                sorted={column === "student_id" ? direction : undefined}
                onClick={handleSort("student_id")}
              >
                student_id
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={
                  column === "config.SHOW_DROPOUT" ? direction : undefined
                }
                onClick={handleSort("config.SHOW_DROPOUT")}
              >
                show_dropout
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={
                  column === "config.SHOW_STUDENT_LIST" ? direction : undefined
                }
                onClick={handleSort("config.SHOW_STUDENT_LIST")}
              >
                show_student_list
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {selectedData.map(
              (
                { email, name, locked, tries, type, student_id, config },
                key
              ) => {
                return (
                  <UpdateUser
                    key={key}
                    user={{
                      email,
                      name,
                      locked,
                      tries,
                      type,
                      student_id,
                      config,
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
                      <Table.Cell>
                        {truncate(student_id, { length: 10 })}
                      </Table.Cell>
                      <Table.Cell>
                        <Icon
                          circular
                          name={
                            config?.SHOW_DROPOUT
                              ? "check circle outline"
                              : "times circle outline"
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Icon
                          circular
                          name={
                            config?.SHOW_STUDENT_LIST
                              ? "check circle outline"
                              : "times circle outline"
                          }
                        />
                      </Table.Cell>
                    </Table.Row>
                  </UpdateUser>
                );
              }
            )}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};
