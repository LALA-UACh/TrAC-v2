import classNames from "classnames";
import csv from "csvtojson";
import { conformsTo, toInteger, toString } from "lodash";
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

import { useMutation, useQuery } from "@apollo/react-hooks";

import {
  ADD_USERS_PROGRAMS_ADMIN,
  ALL_PROGRAMS_ADMIN,
  ALL_USERS_ADMIN,
} from "../../../graphql/adminQueries";
import { width45em } from "../../../utils/cssConstants";

export const ImportPrograms: FC = () => {
  const [data, setData] = useRememberState(
    "AdminImportProgramsData",
    "email,program\n"
  );
  const { data: allPrograms } = useQuery(ALL_PROGRAMS_ADMIN);
  const [open, setOpen] = useRememberState("AdminImportProgramsOpen", false);

  const [isEnabled, setIsEnabled] = useState(false);

  const [parsedData, setParsedData] = useState<
    { email?: string; program?: number }[]
  >([]);

  useEffect(() => {
    (async () => {
      const parsedData: any[] = await (async () => {
        if (isJSON(data) && Array.isArray(JSON.parse(data))) {
          return JSON.parse(data);
        }
        return await csv({ ignoreEmpty: true }).fromString(data);
      })();
      setParsedData(
        parsedData.map(({ email, program }) => ({
          email,
          program: program ? toInteger(program) : undefined,
        }))
      );
    })();
  }, [data, setParsedData]);

  useEffect(() => {
    (async () => {
      const allProgramsMapped = allPrograms?.programs.map(({ id }) => id) ?? [];
      setIsEnabled(
        parsedData.length > 0 &&
          parsedData.every(({ email, program }) => {
            if (email && program) {
              return conformsTo(
                { email, program },
                {
                  email: (v: string) => isEmail(v),
                  program: (v: string) => allProgramsMapped.includes(v),
                }
              );
            }
            return false;
          })
      );
    })();
  }, [parsedData, allPrograms]);

  const [importPrograms, { error: errorImportPrograms, loading }] = useMutation(
    ADD_USERS_PROGRAMS_ADMIN,
    {
      variables: {
        user_programs: parsedData,
      },
      update: (cache, { data }) => {
        if (data?.addUsersPrograms) {
          cache.writeQuery({
            query: ALL_USERS_ADMIN,
            data: {
              users: data.addUsersPrograms,
            },
          });
        }
      },
    }
  );

  return (
    <Modal
      open={open}
      trigger={
        <Button primary icon labelPosition="left">
          <Icon name="calendar plus outline" />
          Import Programs
        </Button>
      }
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>Import Programs</Modal.Header>
      <Modal.Content>
        <Grid centered>
          <Grid.Row>
            <Message>
              <Message.Content>
                The content is validated automatically, verifying if all the
                emails are correctly formatted and the programs already exist in
                the current program list
              </Message.Content>
            </Message>
          </Grid.Row>
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
          {errorImportPrograms && (
            <Grid.Row>
              <Message error>
                <Message.Content>{errorImportPrograms.message}</Message.Content>
              </Message>
            </Grid.Row>
          )}
          <Grid.Row>
            <Form>
              <Form.Button
                icon
                labelPosition="left"
                size="big"
                color="blue"
                onClick={async () => {
                  try {
                    await importPrograms();
                  } catch (err) {
                    console.error(JSON.stringify(err, null, 2));
                  }
                }}
                disabled={!isEnabled || loading}
                loading={loading}
              >
                <Icon name="plus circle" />
                Import
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
                rows={(data.match(/\n/g) || []).length + 3}
                value={data}
              />
            </Form>
          </Grid.Row>
        </Grid>
      </Modal.Content>
    </Modal>
  );
};
