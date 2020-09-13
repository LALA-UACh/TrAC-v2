import { sortBy, truncate } from "lodash";
import React, { FC, useEffect, useState } from "react";
import { Button, Icon, Message, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { Flex, Stack } from "@chakra-ui/core";

import { UserConfig } from "../../../../constants/userConfig";
import {
  useMailAllLockedUsersAdminMutation,
  UserAdminInfoFragment,
  UserType,
} from "../../../graphql";
import { whiteSpacePreLine, width50percent } from "../../../utils/cssConstants";
import { Confirm } from "../../Confirm";
import { usePagination } from "../Pagination";
import { ImportUsers } from "./ImportUsers";
import { UpdateUser } from "./UpdateUser";

export const Users: FC<{
  users: UserAdminInfoFragment[];
  refetch: () => Promise<unknown>;
  loading: boolean;
}> = ({ users, refetch, loading }) => {
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
  ] = useMailAllLockedUsersAdminMutation();

  const { pagination, selectedData } = usePagination({
    name: "admin_sorted_users",
    data: sortedUsers,
    n: 15,
  });

  return (
    <Stack alignItems="center" spacing="1em">
      <Flex>
        <ImportUsers />
      </Flex>
      <Flex>
        <Stack>
          <>
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
          </>
          {openMailMessage && (
            <Flex>
              <Message
                success={!errorMailLockedUsers ? true : undefined}
                error={!!errorMailLockedUsers ? true : undefined}
                icon
                compact
                size="small"
                css={whiteSpacePreLine}
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
                            <Message.Item css={width50percent} key={key}>
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
            </Flex>
          )}
        </Stack>
      </Flex>

      <Flex>
        <Button
          color="teal"
          icon
          labelPosition="left"
          onClick={() => {
            refetch().catch(console.error);
          }}
          loading={loading}
          disabled={loading}
        >
          <Icon name="refresh" />
          Refetch
        </Button>
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
          stackable
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
                sorted={column === "studentIdValid" ? direction : undefined}
                onClick={handleSort("studentIdValid")}
              >
                studentIdValid
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
              <Table.HeaderCell
                sorted={column === "config.FOREPLAN" ? direction : undefined}
                onClick={handleSort("config.FOREPLAN")}
              >
                foreplan
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {selectedData.map(
              (
                {
                  email,
                  name,
                  locked,
                  tries,
                  type,
                  student_id,
                  studentIdValid,
                  config,
                  ...rest
                },
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
                      studentIdValid,
                      config,
                      ...rest,
                    }}
                  >
                    {({ setOpen }) => {
                      const configObj = config as UserConfig;
                      const configOnClick = (ev: React.MouseEvent) => {
                        ev.stopPropagation();
                        setOpen(true, true);
                      };
                      return (
                        <Table.Row
                          className="cursorPointer"
                          onClick={() => {
                            setOpen(true);
                          }}
                        >
                          <Table.Cell>{email}</Table.Cell>
                          <Table.Cell>{name}</Table.Cell>
                          <Table.Cell width={1}>
                            <Icon
                              circular
                              name={locked ? "lock" : "lock open"}
                            />
                          </Table.Cell>
                          <Table.Cell width={1}>{type}</Table.Cell>
                          <Table.Cell>
                            {truncate(student_id, { length: 10 })}
                          </Table.Cell>
                          <Table.Cell>
                            {type === UserType.Student ? (
                              <Icon
                                circular
                                name={
                                  studentIdValid
                                    ? "check circle outline"
                                    : "ban"
                                }
                              />
                            ) : (
                              "-"
                            )}
                          </Table.Cell>
                          <Table.Cell onClick={configOnClick} width={1}>
                            <Icon
                              circular
                              name={
                                configObj?.SHOW_DROPOUT
                                  ? "check circle outline"
                                  : "times circle outline"
                              }
                            />
                          </Table.Cell>
                          <Table.Cell onClick={configOnClick} width={1}>
                            <Icon
                              circular
                              name={
                                configObj?.SHOW_STUDENT_LIST
                                  ? "check circle outline"
                                  : "times circle outline"
                              }
                            />
                          </Table.Cell>
                          <Table.Cell onClick={configOnClick} width={1}>
                            <Icon
                              circular
                              name={
                                configObj?.FOREPLAN
                                  ? "check circle outline"
                                  : "times circle outline"
                              }
                            />
                          </Table.Cell>
                        </Table.Row>
                      );
                    }}
                  </UpdateUser>
                );
              }
            )}
          </Table.Body>
        </Table>
      </Flex>
    </Stack>
  );
};
