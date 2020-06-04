import sha1 from "crypto-js/sha1";
import { compact, map, some } from "lodash";
import { NextPage } from "next";
import Router from "next/router";
import React, { useContext } from "react";
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
import { Image } from "@chakra-ui/core";

import { USED_OLD_PASSWORD, WRONG_INFO } from "../../../constants";
import { ConfigContext } from "../../../src/context/Config";
import { CURRENT_USER, UNLOCK } from "../../../src/graphql/queries";
import { DarkMode } from "../../../src/utils/dynamicDarkMode";

const UnlockPage: NextPage<{ email: string; unlockKey: string }> = ({
  email,
  unlockKey,
}) => {
  const [
    unlock,
    { error: errorUnlock, loading: loadingUnlock, data: dataUnlock },
  ] = useMutation(UNLOCK, {
    update: (cache, { data }) => {
      if (data?.unlock?.user) {
        cache.writeQuery({
          query: CURRENT_USER,
          data: {
            currentUser: data.unlock,
          },
        });
        Router.push("/");
      }
    },
  });

  const {
    UNLOCK_LENGTH_VALIDATION,
    UNLOCK_SPECIAL_SYMBOL_VALIDATION,
    UNLOCK_LOWERCASE_VALIDATION,
    UNLOCK_UPPERCASE_VALIDATION,
    UNLOCK_NUMBER_VALIDATION,
    UNLOCK_REPEAT_VALIDATION,
    UNLOCK_NEW_PASSWORD_LABEL,
    UNLOCK_NEW_PASSWORD_PLACEHOLDER,
    UNLOCK_NEW_PASSWORD_REPEAT_LABEL,
    UNLOCK_ACTIVE_ACCOUNT_LABEL,
    UNLOCK_ERROR_TITLE,
    UNLOCK_WRONG_INFO_MESSAGE,
    UNLOCK_USER_OLD_PASSWORD_MESSAGE,
  } = useContext(ConfigContext);

  if (errorUnlock) {
    console.error(JSON.stringify(errorUnlock, null, 2));
  }

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

    const validPassword = compact(
      map(conditions.password, (v, k) => {
        if (!v)
          switch (k) {
            case "length":
              return UNLOCK_LENGTH_VALIDATION;
            case "specialSymbol":
              return UNLOCK_SPECIAL_SYMBOL_VALIDATION;
            case "lowercase":
              return UNLOCK_LOWERCASE_VALIDATION;
            case "uppercase":
              return UNLOCK_UPPERCASE_VALIDATION;
            case "number":
              return UNLOCK_NUMBER_VALIDATION;
            default:
              return undefined;
          }
      })
    ).join("\n");

    const validConfirmPassword = !conditions.confirm_password
      ? UNLOCK_REPEAT_VALIDATION
      : "";

    return {
      password: validPassword || undefined,
      confirm_password: validConfirmPassword || undefined,
    };
  };

  if (
    typeof email !== "string" ||
    typeof unlockKey !== "string" ||
    !isEmail(email)
  ) {
    return null;
  }
  return (
    <Grid centered padded>
      <Grid.Row>
        <Image
          alt="LALA"
          src="/lalalink.png"
          height="20vh"
          objectFit="contain"
          objectPosition="center"
        />
      </Grid.Row>
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
                            <label>{UNLOCK_NEW_PASSWORD_LABEL}</label>
                            <FormSemantic.Input
                              {...input}
                              type="password"
                              placeholder={UNLOCK_NEW_PASSWORD_PLACEHOLDER}
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
                          <label>{UNLOCK_NEW_PASSWORD_REPEAT_LABEL}</label>
                          <FormSemantic.Input
                            {...input}
                            type="password"
                            placeholder={UNLOCK_NEW_PASSWORD_PLACEHOLDER}
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
                      {UNLOCK_ACTIVE_ACCOUNT_LABEL}
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
      {(errorUnlock || dataUnlock?.unlock?.error) && (
        <Grid.Row>
          <Message error>
            <Message.Header>{UNLOCK_ERROR_TITLE}</Message.Header>
            <p>
              {(() => {
                if (dataUnlock?.unlock?.error) {
                  switch (dataUnlock.unlock.error) {
                    case WRONG_INFO:
                      return UNLOCK_WRONG_INFO_MESSAGE;
                    case USED_OLD_PASSWORD:
                      return UNLOCK_USER_OLD_PASSWORD_MESSAGE;
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
      <Grid.Row>
        <DarkMode />
      </Grid.Row>
    </Grid>
  );
};

UnlockPage.getInitialProps = (ctx) => {
  const { email, unlockKey } = ctx.query;

  if (
    typeof email !== "string" ||
    typeof unlockKey !== "string" ||
    !isEmail(email)
  ) {
    if (ctx.res) {
      ctx.res.writeHead(302, {
        Location: "/",
        "Content-Type": "text/html; charset=utf-8",
      });
      ctx.res.end();
    } else {
      Router.replace("/");
    }
    return { email: "", unlockKey: "" };
  }
  return { email, unlockKey };
};

export default UnlockPage;
