import { isEqual, sortBy, toInteger } from "lodash";
import React, { FC, Fragment, memo, useEffect, useMemo, useState } from "react";
import { Field, Form } from "react-final-form";
import {
  Button,
  Checkbox,
  Form as FormSemantic,
  Grid,
  Icon,
  Input,
  Label,
  Message,
  Modal,
} from "semantic-ui-react";
import { useRememberState } from "use-remember-state";
import isEmail from "validator/lib/isEmail";
import isInt from "validator/lib/isInt";

import {
  Box,
  Divider,
  Flex,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/core";
import { css } from "@emotion/core";

import { UserType } from "../../../../constants";
import { ThemeStore } from "../../../context/Theme";
import {
  AllUsersAdminDocument,
  useDeleteUserAdminMutation,
  useLockMailUserAdminMutation,
  useResetPersistenceAdminMutation,
  useUpsertUsersAdminMutation,
  useUserPersistencesAdminQuery,
} from "../../../graphql";
import { whiteSpacePreLine } from "../../../utils/cssConstants";
import { Confirm } from "../../Confirm";
import { useUpdateUserConfigModal } from "./UpdateUserConfig";

export interface IUserConfig {
  email: string;
  name: string;
  tries: number;
  type: UserType;
  student_id?: string;
  config: Record<string, unknown>;
  locked: boolean;
}

const UserPersistence: FC<{ user: string }> = memo(({ user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, loading, refetch } = useUserPersistencesAdminQuery({
    variables: {
      user,
    },
    skip: !isOpen,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const theme = ThemeStore.hooks.useTheme();

  const [
    resetPersistence,
    { loading: loadingReset },
  ] = useResetPersistenceAdminMutation({
    onCompleted: () => {
      refetch();
    },
  });

  const dataComp = useMemo(() => {
    return (
      <Stack>
        {sortBy(data?.userPersistences, ({ key }) => key).map((persistence) => {
          return (
            <Fragment key={persistence.key}>
              <Box
                width="fit-content"
                border="2px solid white !important"
                margin="2px"
                padding="4px"
              >
                <Label basic color="black">
                  <Icon name="key" />
                  {persistence.key}
                </Label>
                <Label basic color="black">
                  <Icon name="clock" />
                  {persistence.timestamp}
                </Label>
                <Text margin="2px" padding="2px" whiteSpace="pre">
                  {JSON.stringify(persistence.data, null, 2)}
                </Text>
              </Box>
              <Divider color="white" />
            </Fragment>
          );
        })}
      </Stack>
    );
  }, [data]);

  return (
    <Modal
      trigger={
        <Button icon color="brown" labelPosition="left" type="button">
          <Icon name="database" />
          Persistence
        </Button>
      }
      open={isOpen}
      onOpen={onOpen}
      onClose={onClose}
    >
      <Modal.Header>{user} Persistence Data</Modal.Header>

      <Modal.Content>
        <Stack>
          <Box>
            <Confirm
              header={`You are going to reset ${user} persistence data`}
              confirmButton="Yes, i'm sure"
            >
              <Button
                inverted={theme === "dark"}
                basic
                negative
                icon
                labelPosition="left"
                onClick={() => {
                  resetPersistence({
                    variables: {
                      user,
                    },
                  });
                }}
                disabled={loadingReset}
                loading={loadingReset}
              >
                <Icon name="refresh" /> Reset Data
              </Button>
            </Confirm>
          </Box>
          <Box>{loading && <Spinner />}</Box>
          <Box>{isOpen ? dataComp : null}</Box>
        </Stack>
      </Modal.Content>
    </Modal>
  );
});

const resetFormButtonCSS = css`
  position: absolute;
  right: 0.5em;
  top: 0.5em;
`;

export const UpdateUser: FC<{
  user: IUserConfig;
  children: FC<{
    setOpen: (open: boolean, defaultOpenUserConfig?: boolean) => void;
  }>;
}> = ({ children, user }) => {
  const [open, setOpen] = useRememberState(
    `AdminUpdateUser.${user.email}`,
    false
  );

  useEffect(() => {
    try {
      setOpen(
        Boolean(
          JSON.parse(
            localStorage.getItem(`AdminUpdateUser.${user.email}`) || "false"
          )
        )
      );
    } catch (err) {}
  }, [user.email]);

  const [
    updateUser,
    { error: errorUpdate, loading: loadingUpdateUser },
  ] = useUpsertUsersAdminMutation({
    update: (cache, { data }) => {
      if (data?.upsertUsers) {
        cache.writeQuery({
          query: AllUsersAdminDocument,
          data: {
            users: data.upsertUsers,
          },
        });
      }
    },
  });

  if (errorUpdate) {
    throw errorUpdate;
  }

  const [
    lockMailUser,
    {
      loading: loadingLockMailUser,
      error: errorLockMailUser,
      data: dataLockMailUser,
    },
  ] = useLockMailUserAdminMutation({
    variables: {
      email: user.email,
    },
    update: (cache, { data }) => {
      if (data) {
        cache.writeQuery({
          query: AllUsersAdminDocument,
          data: {
            users: data.lockMailUser.users,
          },
        });
      }
    },
  });

  const [openMailMessage, setOpenMailMessage] = useState(false);

  const [
    deleteUser,
    { loading: loadingDeleteUser },
  ] = useDeleteUserAdminMutation({
    variables: {
      email: user.email,
    },
    update: (cache, { data }) => {
      if (data?.deleteUser) {
        cache.writeQuery({
          query: AllUsersAdminDocument,
          data: {
            users: data.deleteUser,
          },
        });
      }
    },
  });

  const { userConfigModal, config, onOpen } = useUpdateUserConfigModal({
    email: user.email,
    config: user.config,
  });

  return (
    <Modal
      trigger={children({
        setOpen: (open, defaultOpenUserConfig) => {
          if (defaultOpenUserConfig) {
            setTimeout(() => {
              onOpen();
            }, 0);
          }
          setOpen(open);
        },
      })}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      open={open}
    >
      <Modal.Header>{user.email}</Modal.Header>

      <Form
        initialValues={{
          email: user.email,
          name: user.name,
          type: user.type,
          tries: user.tries,
          student_id: user.student_id,
          locked: user.locked,
        }}
        onSubmit={async ({
          email,
          name,
          tries,
          type,
          student_id,
          locked,
        }: {
          email: string;
          name: string;
          tries: number;
          type: UserType;
          student_id?: string;
          locked: boolean;
        }) => {
          try {
            await updateUser({
              variables: {
                users: [
                  {
                    oldEmail: user.email,
                    email: email.trim(),
                    name: name.trim(),
                    tries,
                    student_id: student_id?.trim(),
                    type,
                    locked,
                    config,
                  },
                ],
              },
            });
          } catch (err) {
            console.error(JSON.stringify(err, null, 2));
          }
        }}
      >
        {({ handleSubmit, form: { reset }, pristine, hasValidationErrors }) => {
          return (
            <Modal.Content>
              <Confirm
                header="Are you sure you want to reset all the form fields?"
                content="Any changes in those fields will be lost"
              >
                <Button
                  circular
                  icon
                  secondary
                  css={resetFormButtonCSS}
                  disabled={pristine}
                  onClick={() => reset()}
                >
                  <Icon circular name="redo" />
                </Button>
              </Confirm>

              <Grid centered>
                <FormSemantic onSubmit={handleSubmit}>
                  <Field
                    name="email"
                    initialValue={user.email}
                    validate={(email) => !isEmail(email ?? "")}
                  >
                    {({ input, meta: { error } }) => {
                      return (
                        <FormSemantic.Field>
                          <label>Email</label>
                          <FormSemantic.Input
                            {...input}
                            error={
                              error
                                ? { content: "It should a valid email!" }
                                : false
                            }
                          />
                        </FormSemantic.Field>
                      );
                    }}
                  </Field>
                  <Field
                    name="name"
                    initialValue={user.name}
                    validate={(name) => (name?.length ?? 0) < 2}
                  >
                    {({ input, meta: { error } }) => (
                      <FormSemantic.Field>
                        <label>Nombre</label>
                        <FormSemantic.Input
                          {...input}
                          error={
                            error
                              ? {
                                  content:
                                    "It should be at least a 2 characters name!",
                                }
                              : false
                          }
                        />
                      </FormSemantic.Field>
                    )}
                  </Field>

                  <Field
                    name="tries"
                    initialValue={user.tries}
                    validate={(tries) => !isInt(tries?.toString() ?? "")}
                    parse={(tries) => tries && toInteger(tries)}
                  >
                    {({ input, meta: { error } }) => (
                      <FormSemantic.Field>
                        <label>Tries</label>
                        <FormSemantic.Input
                          {...input}
                          error={
                            error
                              ? { content: "It should be an integer value!" }
                              : false
                          }
                        />
                      </FormSemantic.Field>
                    )}
                  </Field>
                  <Flex justifyContent="center" pt={2} pb={3}>
                    <Box pr={2}>
                      <Field
                        name="type"
                        type="radio"
                        value={UserType.Director}
                        initialValue={user.type}
                      >
                        {({ input }) => (
                          <FormSemantic.Field>
                            <label>Director</label>
                            <Input {...input} />
                          </FormSemantic.Field>
                        )}
                      </Field>
                    </Box>
                    <Box pl={2}>
                      <Field
                        name="type"
                        type="radio"
                        value={UserType.Student}
                        initialValue={user.type}
                      >
                        {({ input }) => (
                          <FormSemantic.Field>
                            <label>Student</label>
                            <Input {...input} />
                          </FormSemantic.Field>
                        )}
                      </Field>
                    </Box>
                  </Flex>

                  <Field name="student_id" initialValue={user.student_id}>
                    {({ input }) => (
                      <FormSemantic.Field>
                        <label>ID (student identification number)</label>
                        <Input {...input} />
                      </FormSemantic.Field>
                    )}
                  </Field>

                  <Field type="checkbox" name="locked">
                    {({ input }) => (
                      <FormSemantic.Field>
                        <Checkbox
                          {...input}
                          toggle
                          label="Locked"
                          onChange={() => {
                            input.onChange(!input.checked);
                          }}
                          type="checkbox"
                        />
                      </FormSemantic.Field>
                    )}
                  </Field>

                  <Button
                    type="submit"
                    icon
                    labelPosition="left"
                    primary
                    disabled={
                      isEqual(config, user.config) &&
                      (pristine ||
                        hasValidationErrors ||
                        loadingUpdateUser ||
                        loadingDeleteUser)
                    }
                    loading={loadingUpdateUser}
                  >
                    <Icon name="save outline" />
                    Save
                  </Button>

                  <UserPersistence user={user.email} />

                  {userConfigModal}

                  <Confirm
                    header={`Are you sure you want to ${
                      user.locked
                        ? "send an activation email"
                        : "lock and send an activation email"
                    } to this user?`}
                    content="It will be given a new unlock key"
                  >
                    <Button
                      type="button"
                      icon
                      labelPosition="left"
                      secondary
                      onClick={async () => {
                        try {
                          await lockMailUser();
                        } catch (err) {
                          console.error(JSON.stringify(err, null, 2));
                        }
                        setOpenMailMessage(true);
                      }}
                      disabled={loadingDeleteUser || loadingLockMailUser}
                      loading={loadingLockMailUser}
                    >
                      <Icon name={user.locked ? "mail" : "lock"} />
                      {user.locked
                        ? "Send an activation email"
                        : "Lock and send an activation email"}
                    </Button>
                  </Confirm>

                  <Confirm
                    header="Are you sure you want to remove this user?"
                    content="The user is not going to be available in this system"
                  >
                    <Button
                      type="button"
                      icon
                      labelPosition="left"
                      color="red"
                      onClick={async () => {
                        try {
                          await deleteUser();
                          localStorage.setItem(
                            `AdminUpdateUser.${user.email}`,
                            JSON.stringify(false)
                          );
                          setOpen(false);
                        } catch (err) {
                          console.error(JSON.stringify(err, null, 2));
                        }
                      }}
                      disabled={loadingDeleteUser || loadingUpdateUser}
                      loading={loadingDeleteUser || loadingUpdateUser}
                    >
                      <Icon name="remove user" />
                      Remove
                    </Button>
                  </Confirm>
                </FormSemantic>
                {openMailMessage && (
                  <Grid.Row>
                    <Message
                      success={!errorLockMailUser ? true : undefined}
                      error={!!errorLockMailUser ? true : undefined}
                      icon
                      compact
                      size="small"
                      css={whiteSpacePreLine}
                    >
                      <Icon
                        name="close"
                        onClick={() => setOpenMailMessage(false)}
                      />
                      <Message.Content>
                        {errorLockMailUser && (
                          <Message.Header>Error!</Message.Header>
                        )}
                        {errorLockMailUser && errorLockMailUser.message}
                        {dataLockMailUser &&
                          JSON.stringify(
                            dataLockMailUser.lockMailUser.mailResult,
                            null,
                            2
                          )}
                      </Message.Content>
                    </Message>
                  </Grid.Row>
                )}
              </Grid>
            </Modal.Content>
          );
        }}
      </Form>
    </Modal>
  );
};
