import { isJSON } from "validator";

import { AdminContext } from "@components/admin/Context";
import classNames from "@components/admin/Programs/importPrograms/node_modules/classnames";
import csv from "@components/admin/Programs/importPrograms/node_modules/csvtojson";
import _ from "@components/admin/Programs/importPrograms/node_modules/lodash";
import {
    FunctionComponent, useContext
} from "@components/admin/Programs/importPrograms/node_modules/react";
import Dropzone from "@components/admin/Programs/importPrograms/node_modules/react-dropzone";
import {
    Button, Form, Grid, Icon, Modal, TextArea
} from "@components/admin/Programs/importPrograms/node_modules/semantic-ui-react";
import {
    useRememberState
} from "@components/admin/Programs/importPrograms/node_modules/use-remember-state";

const ImportPrograms: FunctionComponent = () => {
  const [data, setData] = useRememberState(
    "AdminImportProgramsData",
    "email,program\n"
  );
  const [open, setOpen] = useRememberState("AdminImportProgramsOpen", false);
  const { importPrograms } = useContext(AdminContext);

  const handleSubmit = () => {
    try {
      if (isJSON(data) && _.isArray(JSON.parse(data))) {
        importPrograms(JSON.parse(data));
        setOpen(false);
        setData("email,program\n");
      } else {
        csv({
          ignoreEmpty: true
        })
          .fromString(data)
          .then(
            json => {
              importPrograms(json);
              setOpen(false);
              setData("email,program\n");
            },
            error => {
              console.error(error);
            }
          );
      }
    } catch (err) {
      console.error(err);
    }
  };

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
                onClick={() => handleSubmit()}
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

export default ImportPrograms;
