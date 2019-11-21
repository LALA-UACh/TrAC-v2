import sha1 from "crypto-js/sha1";
import map from "lodash/map";
import some from "lodash/some";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Field, Form } from "react-final-form";
import {
  Divider,
  Form as FormSemantic,
  Grid,
  Icon,
  Message,
  Segment,
} from "semantic-ui-react";
import isEmail from "validator/lib/isEmail";
import matches from "validator/lib/matches";

import { useMutation } from "@apollo/react-hooks";
import { USED_OLD_PASSWORD, WRONG_INFO } from "@constants";
import { currentUserQuery, unlockMutation } from "@graphql/queries";

const validatePassword = (password = "", confirm_password = "") => {
  const conditions = {
    password: {
      length: password.length >= 8 && password.length <= 100,
      specialSymbol: matches(password, /[~¡!$&+,:;=¿?@#|'<>.^*(){}"%\-_]/),
      lowercase: matches(password, /[a-z]/),
      uppercase: matches(password, /[A-Z]/),
      number: matches(password, /[0-9]/),
    },

    confirm_password: password === confirm_password,
  };

  const validPassword = map(conditions.password, (v, k) => {
    if (!v)
      switch (k) {
        case "length":
          return "El largo de la contraseña tiene que ser de al menos 8 caracteres y máximo de 100 caracteres.";
        case "specialSymbol":
          return `La contraseña debe contener al menos un caracter especial (~¡!$&+,:;=¿?@#|'<>.^*(){}"%-_).`;
        case "lowercase":
          return "La contraseña debe contener al menos una letra minúscula.";
        case "uppercase":
          return "La contraseña debe contener al menos una letra mayúscula.";
        case "number":
          return "La contraseña debe contener al menos un número.";
      }
  })
    .filter(v => v)
    .join("\n");

  const validConfirmPassword = !conditions.confirm_password
    ? "Debe repetir su contraseña correctamente."
    : "";

  return {
    password: validPassword || undefined,
    confirm_password: validConfirmPassword || undefined,
  };
};
export default () => {
  const {
    query: { email, unlockKey },
    replace,
    push,
  } = useRouter();

  const [
    unlock,
    { error: errorUnlock, loading: loadingUnlock, data: dataUnlock },
  ] = useMutation(unlockMutation, {
    update: (cache, { data }) => {
      if (data?.unlock.user) {
        cache.writeQuery({
          query: currentUserQuery,
          data: {
            currentUser: data.unlock.user,
          },
        });
        push("/");
      }
    },
  });

  useEffect(() => {
    if (
      typeof email !== "string" ||
      typeof unlockKey !== "string" ||
      !isEmail(email)
    ) {
      replace("/");
    }
  }, []);

  if (errorUnlock) {
    console.error(JSON.stringify(errorUnlock, null, 2));
  }

  if (
    typeof email !== "string" ||
    typeof unlockKey !== "string" ||
    !isEmail(email)
  ) {
    return null;
  }
  return (
    <Grid centered>
      <Divider hidden />
      <Grid.Row>
        <Message info>{email}</Message>
      </Grid.Row>
      <Form<{ password: string; confirm_password: string }>
        onSubmit={({ password }) => {
          unlock({
            variables: {
              email,
              password: sha1(password).toString(),
              unlockKey,
            },
          });
        }}
        validate={({ password, confirm_password }) => {
          return validatePassword(password, confirm_password);
        }}
      >
        {({ handleSubmit, dirty, valid, invalid, touched, errors }) => {
          return (
            <>
              <Grid.Row>
                <FormSemantic onSubmit={handleSubmit}>
                  <Segment size="big" basic>
                    <Field name="password" initialValue="">
                      {({ input, meta: { invalid, touched } }) => {
                        return (
                          <FormSemantic.Field
                            error={dirty || touched ? invalid : false}
                          >
                            <label>Nueva contraseña</label>
                            <FormSemantic.Input
                              {...input}
                              type="password"
                              placeholder="contraseña"
                              autoComplete="new-password"
                            />
                          </FormSemantic.Field>
                        );
                      }}
                    </Field>
                  </Segment>
                  <Segment size="big" basic>
                    <Field name="confirm_password" initialValue="">
                      {({ input, meta: { invalid, touched } }) => (
                        <FormSemantic.Field
                          error={dirty || touched ? invalid : false}
                        >
                          <label>Repita su contraseña</label>
                          <FormSemantic.Input
                            {...input}
                            type="password"
                            placeholder="contraseña"
                            autoComplete="new-password"
                          />
                        </FormSemantic.Field>
                      )}
                    </Field>
                  </Segment>
                  <Segment size="big" basic>
                    <FormSemantic.Button
                      type="submit"
                      icon
                      primary
                      labelPosition="left"
                      disabled={invalid || loadingUnlock}
                      size="big"
                      loading={loadingUnlock}
                    >
                      <Icon name="lock open" />
                      Activar cuenta
                    </FormSemantic.Button>
                  </Segment>
                </FormSemantic>
              </Grid.Row>

              <Grid.Row>
                <Message warning hidden={dirty || some(touched) ? valid : true}>
                  <Message.List>
                    {Object.values<string>(errors).map((error, k) => {
                      if (error)
                        return error.split("\n").map((errorMessage, key) => {
                          return (
                            <Message.Item
                              key={k + key}
                              content={errorMessage}
                            />
                          );
                        });
                    })}
                  </Message.List>
                </Message>
              </Grid.Row>
            </>
          );
        }}
      </Form>
      {(errorUnlock || dataUnlock?.unlock.error) && (
        <Grid.Row>
          <Message error>
            <Message.Header>Error!</Message.Header>
            <p>
              {(() => {
                if (dataUnlock?.unlock.error) {
                  switch (dataUnlock.unlock.error) {
                    case WRONG_INFO:
                      return "Usuario ingresado no está bloqueado o el código ingresado es erróneo.";
                    case USED_OLD_PASSWORD:
                      return "No puede ingresar una contraseña usada anteriormente.";
                    default:
                      return dataUnlock.unlock.error;
                  }
                }
                return errorUnlock?.message;
              })()}
            </p>
          </Message>
        </Grid.Row>
      )}
    </Grid>
  );
};
