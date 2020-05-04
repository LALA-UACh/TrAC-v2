import classNames from "classnames";
import csv from "csvtojson";
import { toInteger, toString } from "lodash";
import React, { FC, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import {
  Button,
  Form,
  Grid,
  Icon,
  Message,
  Modal,
  TextArea,
} from "semantic-ui-react";
import { useRememberState } from "use-remember-state";
import isEmail from "validator/lib/isEmail";
import isJSON from "validator/lib/isJSON";

import { useMutation } from "@apollo/react-hooks";

import {
  ALL_USERS_ADMIN,
  UPSERT_USERS_ADMIN,
} from "../../../graphql/adminQueries";
import { width45em } from "../../../utils/cssConstants";

export const ImportUsers: FC = () => {
  const [data, setData] = useRememberState("AdminImportUsersData", "email\n");
  const [open, setOpen] = useRememberState("AdminImportUsersOpen", false);

  const [isEnabled, setIsEnabled] = useState(false);

  const [parsedData, setParsedData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const parsedData: any[] = await (async () => {
        if (isJSON(data) && Array.isArray(JSON.parse(data))) {
          return JSON.parse(data);
        }
        return await csv({ ignoreEmpty: true }).fromString(data);
      })();
      setParsedData(
        parsedData.map(({ tries, ...rest }) => {
          return {
            tries: tries && toInteger(tries),
            ...rest,
          };
        })
      );
    })();
  }, [data, setParsedData]);

  useEffect(() => {
    setIsEnabled(
      parsedData.length > 0 &&
        parsedData.every(({ email }) => {
          return isEmail(email?.toString() ?? "");
        })
    );
  });

  const [importUsers, { error, loading }] = useMutation(UPSERT_USERS_ADMIN, {
    update: (cache, { data }) => {
      if (data?.upsertUsers) {
        cache.writeQuery({
          query: ALL_USERS_ADMIN,
          data: {
            users: data.upsertUsers,
          },
        });
      }
    },
  });

  const handleSubmit = async () => {
    if (isEnabled) {
      try {
        await importUsers({
          variables: {
            users: parsedData,
          },
        });
        setOpen(false);
      } catch (err) {
        console.error(JSON.stringify(err, null, 2));
      }
    }
  };

  return (
    <Modal
      open={open}
      trigger={
        <Button primary icon labelPosition="left">
          <Icon name="add user" />
          Upsert users
        </Button>
      }
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>Upsert users</Modal.Header>
      <Modal.Content>
        <Grid centered>
          <Grid.Row>
            <Dropzone
              accept=".json,.csv"
              onDrop={(acceptedFiles, _rejectedFiles) => {
                acceptedFiles.forEach(async (file, _key) => {
                  fetch(URL.createObjectURL(file))
                    .then((response) => response.text())
                    .then((text) => {
                      setData(data + text);
                    });
                });
              }}
            >
              {({ getRootProps, getInputProps, isDragActive }) => {
                return (
                  <div
                    {...getRootProps()}
                    className={classNames("dropzone", {
                      "dropzone--isActive": isDragActive,
                    })}
                  >
                    <Button
                      icon
                      labelPosition="left"
                      circular
                      size="huge"
                      color="brown"
                    >
                      <Icon name="upload" />
                      Upload file
                    </Button>
                    <input {...getInputProps()} />
                  </div>
                );
              }}
            </Dropzone>
          </Grid.Row>
          {error && (
            <Grid.Row>
              <Message error>
                <Message.Content>{error.message}</Message.Content>
              </Message>
            </Grid.Row>
          )}
          {!isEnabled && parsedData.length > 0 && (
            <Message error>
              <Message.Content>
                Each row has to have at least a valid email
              </Message.Content>
            </Message>
          )}

          <Grid.Row>
            <Form>
              <Form.Button
                icon
                labelPosition="left"
                size="big"
                color="blue"
                onClick={() => handleSubmit()}
                disabled={!isEnabled || loading}
                loading={loading}
              >
                <Icon name="plus circle" />
                Upsert
              </Form.Button>
              <TextArea
                ref={(ref) => {
                  if (ref) ref.focus();
                }}
                onChange={(_event, { value }) => {
                  setData(toString(value));
                }}
                css={width45em}
                placeholder=".json o .csv"
                value={data}
              />
            </Form>
          </Grid.Row>
        </Grid>
      </Modal.Content>
    </Modal>
  );
};
