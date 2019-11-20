import { cloneElement, FC, useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import {
    Button, Checkbox, Form as FormSemantic, Grid, Icon, Input, Modal
} from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { Box, Flex } from "@chakra-ui/core";
import { Confirm } from "@components/Confirm";
import { UserType } from "@constants";

export const UpdateUser: FC<{
  user: {
    email: string;
    name: string;
    tries: number;
    type: UserType;
    id?: string;
    show_dropout: boolean;
    locked: boolean;
  };
  children: JSX.Element;
}> = ({ children, user }) => {
  const [open, setOpen] = useRememberState(
    `AdminUpdateUser.${user.email}`,
    false
  );
  const [locked, setLocked] = useState(!!user.locked);
  const [show_dropout, setShowDropout] = useState(!!user.show_dropout);

  useEffect(() => {
    setOpen(
      JSON.parse(
        localStorage.getItem(`AdminUpdateUser.${user.email}`) || "false"
      )
    );
  }, [user.email]);

  useEffect(() => {
    setLocked(user.locked);
  }, [user.locked]);

  // const updateUser = (...a: any) => {};
  // TODO: updateUser mutation

  // TODO: lockUser mutation

  const lockUser = (...any: any) => {};

  const deleteUser = (...any: any) => {};
  // TODO: deleteUser mutation
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
        onSubmit={({
          email,
          name,
          tries,
          type,
          id = "",
        }: {
          email: string;
          name: string;
          tries: number;
          type: UserType;
          id: string;
        }) => {
          // updateUser(user, {
          //   email,
          //   name,
          //   tries,
          //   type,
          //   id,
          //   locked,
          //   show_dropout
          // });
        }}
      >
        {({ handleSubmit, form: { reset }, pristine }) => (
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
                onClick={() => {
                  reset(user);
                  setLocked(user.locked);
                  setShowDropout(user.show_dropout);
                }}
                disabled={
                  pristine &&
                  locked === user.locked &&
                  show_dropout === user.show_dropout
                }
              >
                <Icon circular name="redo" />
              </Button>
            </Confirm>

            <Grid centered>
              <FormSemantic onSubmit={handleSubmit}>
                <Field name="email" initialValue={user.email}>
                  {({ input }) => (
                    <FormSemantic.Field>
                      <label>Email</label>
                      <Input {...input} />
                    </FormSemantic.Field>
                  )}
                </Field>
                <Field name="name" initialValue={user.name}>
                  {({ input }) => (
                    <FormSemantic.Field>
                      <label>Nombre</label>
                      <Input {...input} />
                    </FormSemantic.Field>
                  )}
                </Field>

                <Field name="tries" initialValue={user.tries}>
                  {({ input }) => (
                    <FormSemantic.Field>
                      <label>Intentos</label>
                      <Input {...input} />
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

                <Field name="id" initialValue={user.id}>
                  {({ input }) => (
                    <FormSemantic.Field>
                      <label>ID (rut student)</label>
                      <Input {...input} />
                    </FormSemantic.Field>
                  )}
                </Field>
                <FormSemantic.Field>
                  <Checkbox
                    toggle
                    label="Mostrar Dropout"
                    checked={show_dropout}
                    onChange={() => setShowDropout(!show_dropout)}
                  />
                </FormSemantic.Field>

                <FormSemantic.Field>
                  <Checkbox
                    toggle
                    label="Bloqueado"
                    checked={locked}
                    onChange={() => setLocked(!locked)}
                  />
                </FormSemantic.Field>
                <Button
                  type="submit"
                  icon
                  labelPosition="left"
                  primary
                  disabled={
                    pristine &&
                    locked === user.locked &&
                    show_dropout === user.show_dropout
                  }
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
                    onClick={() => {
                      lockUser(user.email);
                      setOpen(true);
                    }}
                  >
                    <Icon name={user.locked ? "mail" : "lock"} />
                    {user.locked
                      ? "Enviar correo de activación"
                      : "Bloquear y enviar correo de activación"}
                  </Button>
                </Confirm>

                <Confirm
                  header="¿Está seguro que desea eliminar este usuario?"
                  content="Asegurese que no haya referencias a este usuario en la tabla de programas"
                >
                  <Button
                    type="button"
                    icon
                    labelPosition="left"
                    color="red"
                    onClick={() => {
                      deleteUser(user.email);
                      setOpen(false);
                    }}
                  >
                    <Icon name="remove user" />
                    Eliminar
                  </Button>
                </Confirm>
              </FormSemantic>
            </Grid>
          </Modal.Content>
        )}
      </Form>
    </Modal>
  );
};
