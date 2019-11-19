import classNames from "classnames";
import csv from "csvtojson";
import _ from "lodash";
import { FC, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { Button, Form, Grid, Icon, Message, Modal, TextArea } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";
import isEmail from "validator/lib/isEmail";
import isJSON from "validator/lib/isJSON";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { addUsersProgramsAdmin, allProgramsAdmin, allUsersAdmin } from "@graphql/queries";

export const ImportPrograms: FC = () => {
  const [data, setData] = useRememberState(
    "AdminImportProgramsData",
    "email,program\n"
  );
  const { data: allPrograms } = useQuery(allProgramsAdmin);
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
          program: program ? _.toInteger(program) : undefined
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
              return _.conformsTo(
                { email, program },
                {
                  email: (v: string) => isEmail(v),
                  program: (v: string) =>
                    allProgramsMapped.includes(_.toInteger(v))
                }
              );
            }
            return false;
          })
      );
    })();
  }, [parsedData, allPrograms]);

  const [importPrograms, { error: errorImportPrograms }] = useMutation(
    addUsersProgramsAdmin,
    {
      variables: {
        user_programs: parsedData
      },
      update: (cache, { data }) => {
        if (data?.addUsersPrograms) {
          cache.writeQuery({
            query: allUsersAdmin,
            data: {
              users: data.addUsersPrograms
            }
          });
        }
      }
    }
  );

  if (errorImportPrograms) {
    throw new Error(errorImportPrograms.message);
  }

  return (
    <Modal
      open={open}
      trigger={
        <Button primary icon labelPosition="left">
          <Icon name="calendar plus outline" />
          Importar Programas
        </Button>
      }
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>Importar Programas</Modal.Header>
      <Modal.Content>
        <Grid centered>
          <Grid.Row>
            <Message>
              <Message.Content>
                El contenido es validado automaticamente, verificando que los
                email estén correctamente formateados y los programas existen en
                la lista de programas actuales
              </Message.Content>
            </Message>
          </Grid.Row>
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
                      "dropzone--isActive": isDragActive
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
                      Subir archivo
                    </Button>
                    <input {...getInputProps()} />
                  </div>
                );
              }}
            </Dropzone>
          </Grid.Row>
          <Grid.Row>
            <Form>
              <Form.Button
                icon
                labelPosition="left"
                size="big"
                color="blue"
                onClick={() => {
                  importPrograms();
                }}
                disabled={!isEnabled}
              >
                <Icon name="plus circle" />
                Importar
              </Form.Button>

              <TextArea
                ref={ref => {
                  if (ref) ref.focus();
                }}
                onChange={(_event, { value }) => {
                  setData(_.toString(value));
                }}
                style={{ width: "45em" }}
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
