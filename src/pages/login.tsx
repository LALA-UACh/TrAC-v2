import sha1 from "crypto-js/sha1";
import { ValidationErrors } from "final-form";
import gql from "graphql-tag";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import {
    Button, Checkbox, Form as FormSemantic, Grid, Icon, Input, Message, Segment
} from "semantic-ui-react";
import { isEmail, isLength } from "validator";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { LOCKED_USER, WRONG_INFO } from "@constants";
import { currentUser } from "@graphql/queries";

const Login: FC = () => {
  const [session, setSession] = useState<boolean>(() =>
    Cookies.get("remember") ? true : false
  );

  useEffect(() => {
    if (session) {
      Cookies.set("remember", "1");
    } else {
      Cookies.remove("remember");
    }
  }, [session]);

  const [login, { data, loading, called, client }] = useMutation<
    {
      login: {
        user?: { email: string; name: string; admin: string };
        error?: string;
      };
    },
    { email: string; password: string }
  >(gql`
    mutation($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        user {
          email
          name
          admin
        }
        error
      }
    }
  `);

  useEffect(() => {
    if (called && !loading && data) {
      const { user: current_user } = data.login;
      if (current_user) {
        client?.writeQuery({
          query: currentUser,
          data: {
            current_user
          }
        });
      }
    }
  }, [called, loading, called, data]);

  return (
    <Grid centered padded>
      <Grid.Row>
        <img alt="LALA" src="/lalalink.png" className="lalalink-image" />
      </Grid.Row>

      {!loading && data?.login?.error && (
        <Grid.Row>
          <Message negative>
            <Message.Header>Error!</Message.Header>
            {(() => {
              switch (data.login.error) {
                case WRONG_INFO:
                  return "Información ingresada erronea. Verificar datos o su cuenta puede ser bloqueda por seguridad.";
                case LOCKED_USER:
                  return "Usuario bloqueado. Por favor revisar correo para recuperar su cuenta.";
                default:
                  return data.login.error;
              }
            })()}
          </Message>
        </Grid.Row>
      )}

      <Form
        onSubmit={({
          email,
          password
        }: {
          email: string;
          password: string;
        }) => {
          login({
            variables: {
              email,
              password: sha1(password).toString()
            }
          });
        }}
        validate={({ email, password }) => {
          const errors: ValidationErrors = {};
          if (!email || !isEmail(email)) {
            errors["email"] = "Ingrese un Email Válido";
          }
          if (!password || !isLength(password, { min: 3, max: 100 })) {
            errors["password"] = "Ingrese una contraseña de largo válido";
          }
          return errors;
        }}
      >
        {({ handleSubmit, pristine, invalid }) => {
          return (
            <FormSemantic size="big" onSubmit={handleSubmit}>
              <Segment size="big" basic>
                <Field name="email" type="email" initialValue="">
                  {({ input, meta: { touched, error } }) => (
                    <FormSemantic.Field error={error && touched}>
                      <label>Correo Electrónico</label>
                      <Input {...input} placeholder="email@uach.cl" />
                      <label>{touched && error}</label>
                    </FormSemantic.Field>
                  )}
                </Field>

                <Field name="password" initialValue="" type="password">
                  {({ input, meta: { touched, error } }) => (
                    <FormSemantic.Field error={error && touched}>
                      <label>Contraseña</label>
                      <Input {...input} placeholder="contraseña" />
                      {<label>{touched && error}</label>}
                    </FormSemantic.Field>
                  )}
                </Field>
              </Segment>
              <Segment basic>
                <Checkbox
                  toggle
                  label="Mantenerse conectado"
                  onChange={() => {
                    setSession(!session);
                  }}
                  checked={session}
                />
              </Segment>
              <Segment basic>
                <Button
                  as="button"
                  type="submit"
                  size="big"
                  color="blue"
                  disabled={pristine || invalid}
                  icon
                  labelPosition="left"
                >
                  <Icon name="sign-in" />
                  Ingresar
                </Button>
              </Segment>
            </FormSemantic>
          );
        }}
      </Form>
    </Grid>
  );
};

export default () => {
  const { data, loading } = useQuery<{ current_user?: { email: string } }>(
    currentUser,
    { ssr: false }
  );
  const { push } = useRouter();
  useEffect(() => {
    if (!loading && data && data?.current_user?.email) {
      push("/");
    }
  }, [loading, data]);

  if (loading || !data || data?.current_user?.email) {
    return null;
  }
  return <Login />;
};
