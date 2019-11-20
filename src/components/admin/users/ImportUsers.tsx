import classNames from "classnames";
import csv from "csvtojson";
import { toString } from "lodash";
import toInteger from "lodash/toInteger";
import { FC, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { Button, Form, Grid, Icon, Message, Modal, TextArea } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";
import { isJSON } from "validator";
import isEmail from "validator/lib/isEmail";

import { useMutation } from "@apollo/react-hooks";
import { adminUpsertUsersMutation, allUsersAdminQuery } from "@graphql/adminQueries";

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

  const [importUsers, { error, loading }] = useMutation(adminUpsertUsersMutation, {
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
          Upsert Usuarios
        </Button>
      }
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>Upsert Usuarios</Modal.Header>
      <Modal.Content>
        <Grid centered>
          <Grid.Row>
            <Dropzone
              accept=".json,.csv"
              onDrop={(acceptedFiles, _rejectedFiles) => {
                acceptedFiles.forEach(async (file, _key) => {
                  fetch(URL.createObjectURL(file))
                    .then(response => response.text())
                    .then(text => {
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
                    <Button icon labelPosition="left" circular size="huge" color="brown">
                      <Icon name="upload" />
                      Subir archivo
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
              <Message.Content>Cada fila debe contener al menos un correo válido</Message.Content>
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
                ref={ref => {
                  if (ref) ref.focus();
                }}
                onChange={(_event, { value }) => {
                  setData(toString(value));
                }}
                rows={(data.match(/\n/g) || []).length + 3}
                style={{ width: "45em" }}
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
