import toInteger from "lodash/toInteger";
import { cloneElement, FC, useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import {
    Button, Checkbox, Form as FormSemantic, Grid, Icon, Input, Message, Modal
} from "semantic-ui-react";
import { useRememberState } from "use-remember-state";
import { isEmail, isInt } from "validator";

import { useMutation } from "@apollo/react-hooks";
import { Box, Flex } from "@chakra-ui/core";
import { Confirm } from "@components/Confirm";
import { UserType } from "@constants";
import {
    adminDeleteUserMutation, adminLockMailUserMutation, adminUpsertUsersMutation, allUsersAdminQuery
} from "@graphql/adminQueries";

export const UpdateUser: FC<{
  user: {
    email: string;
    name: string;
    tries: number;
    type: UserType;
    rut_id?: string;
    show_dropout: boolean;
    locked: boolean;
  };
  children: JSX.Element;
}> = ({ children, user }) => {
  const [open, setOpen] = useRememberState(`AdminUpdateUser.${user.email}`, false);

  useEffect(() => {
    setOpen(JSON.parse(localStorage.getItem(`AdminUpdateUser.${user.email}`) || "false"));
  }, [user.email]);

  const [updateUser, { error: errorUpdate, loading: loadingUpdateUser }] = useMutation(
    adminUpsertUsersMutation,
    {
      update: (cache, { data }) => {
        if (data?.upsertUsers) {
          cache.writeQuery({
            query: allUsersAdminQuery,
            data: {
              users: data.upsertUsers,
            },
          });
        }
      },
    }
  );

  if (errorUpdate) {
    throw errorUpdate;
  }

  const [
    lockMailUser,
    { loading: loadingLockMailUser, error: errorLockMailUser, data: dataLockMailUser },
  ] = useMutation(adminLockMailUserMutation, {
    variables: {
      email: user.email,
    },
    update: (cache, { data }) => {
      if (data) {
        cache.writeQuery({
          query: allUsersAdminQuery,
          data: {
            users: data.lockMailUser.users,
          },
        });
      }
    },
  });

  const [openMailMessage, setOpenMailMessage] = useState(false);

  const [deleteUser, { loading: loadingDeleteUser }] = useMutation(adminDeleteUserMutation, {
    variables: {
      email: user.email,
    },
    update: (cache, { data }) => {
      if (data?.deleteUser) {
        cache.writeQuery({
          query: allUsersAdminQuery,
          data: {
            users: data.deleteUser,
          },
        });
      }
    },
  });
  return (
    <Modal
      trigger={cloneElement(children, {
        onClick: () => setOpen(true),
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
          rut_id: user.rut_id,
          show_dropout: user.show_dropout,
          locked: user.locked,
        }}
        onSubmit={async ({
          email,
          name,
          tries,
          type,
          rut_id,
          show_dropout,
          locked,
        }: {
          email: string;
          name: string;
          tries: number;
          type: UserType;
          rut_id?: string;
          show_dropout: boolean;
          locked: boolean;
        }) => {
          try {
            await updateUser({
              variables: {
                users: [
                  {
                    oldEmail: user.email,
                    email,
                    name,
                    tries,
                    rut_id,
                    type,
                    show_dropout,
                    locked,
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
                header="¿Está seguro que desea resetear los campos del formulario a los obtenidos desde la base de datos?"
                content="Cualquier cambio en los campos de información va a ser perdido"
              >
                <Button
                  circular
                  icon
                  secondary
                  style={{
                    position: "absolute",
                    right: "0.5em",
                    top: "0.5em",
                  }}
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
                    validate={email => !isEmail(email ?? "")}
                  >
                    {({ input, meta: { error } }) => {
                      return (
                        <FormSemantic.Field>
                          <label>Email</label>
                          <FormSemantic.Input
                            {...input}
                            error={error ? { content: "Debe ser un correo válido!" } : false}
                          />
                        </FormSemantic.Field>
                      );
                    }}
                  </Field>
                  <Field
                    name="name"
                    initialValue={user.name}
                    validate={name => (name?.length ?? 0) < 2}
                  >
                    {({ input, meta: { error } }) => (
                      <FormSemantic.Field>
                        <label>Nombre</label>
                        <FormSemantic.Input
                          {...input}
                          error={
                            error
                              ? { content: "Debe ser un nombre de al menos 2 caracteres!" }
                              : false
                          }
                        />
                      </FormSemantic.Field>
                    )}
                  </Field>

                  <Field
                    name="tries"
                    initialValue={user.tries}
                    validate={tries => !isInt(tries?.toString() ?? "")}
                    parse={tries => tries && toInteger(tries)}
                  >
                    {({ input, meta: { error } }) => (
                      <FormSemantic.Field>
                        <label>Intentos</label>
                        <FormSemantic.Input
                          {...input}
                          error={error ? { content: "Debe ser un valor entero!" } : false}
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
                            <label>Estudiante</label>
                            <Input {...input} />
                          </FormSemantic.Field>
                        )}
                      </Field>
                    </Box>
                  </Flex>

                  <Field name="rut_id" initialValue={user.rut_id}>
                    {({ input }) => (
                      <FormSemantic.Field>
                        <label>ID (rut student)</label>
                        <Input {...input} />
                      </FormSemantic.Field>
                    )}
                  </Field>

                  <Field type="checkbox" name="show_dropout">
                    {({ input }) => (
                      <FormSemantic.Field>
                        <Checkbox
                          {...input}
                          toggle
                          label="Mostrar Dropout"
                          onChange={() => {
                            input.onChange(!input.checked);
                          }}
                          type="checkbox"
                        />
                      </FormSemantic.Field>
                    )}
                  </Field>

                  <Field type="checkbox" name="locked">
                    {({ input }) => (
                      <FormSemantic.Field>
                        <Checkbox
                          {...input}
                          toggle
                          label="Bloqueado"
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
                      pristine || hasValidationErrors || loadingUpdateUser || loadingDeleteUser
                    }
                    loading={loadingUpdateUser}
                  >
                    <Icon name="save outline" />
                    Guardar
                  </Button>

                  <Confirm
                    header={`¿Está seguro que desea ${
                      user.locked
                        ? "enviar un correo de activación"
                        : "bloquear y enviar un correo de activación"
                    } a este usuario?`}
                    content="Va a ser enviado un correo electrónico al usuario en conjunto con un código de activación nuevo"
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
                        ? "Enviar correo de activación"
                        : "Bloquear y enviar correo de activación"}
                    </Button>
                  </Confirm>

                  <Confirm
                    header="¿Está seguro que desea eliminar este usuario?"
                    content="El usuario dejará de estar disponible en el sistema"
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
                      Eliminar
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
                      style={{ whiteSpace: "pre-line" }}
                    >
                      <Icon name="close" onClick={() => setOpenMailMessage(false)} />
                      <Message.Content>
                        {errorLockMailUser && <Message.Header>Error!</Message.Header>}
                        {errorLockMailUser && errorLockMailUser.message}
                        {dataLockMailUser &&
                          JSON.stringify(dataLockMailUser.lockMailUser.mailResult, null, 2)}
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
