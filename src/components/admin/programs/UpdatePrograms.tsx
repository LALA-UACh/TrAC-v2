import { truncate } from "lodash";
import { cloneElement, FC, useEffect, useState } from "react";
import { Button, Dropdown, Grid, Icon, Label, Modal } from "semantic-ui-react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Confirm } from "@components/Confirm";
import {
  allProgramsAdminQuery,
  allUsersAdminQuery,
  updateUserProgramsAdminMutation,
} from "@graphql/adminQueries";

export const UpdatePrograms: FC<{
  program: { email: string; programs: number[] };
  children: JSX.Element;
}> = ({ children, program }) => {
  const [open, setOpen] = useState(false);

  const { data: allPrograms } = useQuery(allProgramsAdminQuery);

  const [selectedPrograms, setSelectedPrograms] = useState(program.programs);

  useEffect(() => {
    setSelectedPrograms(program.programs);
  }, [program.programs]);

  const [updateProgram] = useMutation(updateUserProgramsAdminMutation, {
    variables: {
      update_user: {
        oldPrograms: program.programs,
        email: program.email,
        programs: selectedPrograms,
      },
    },
    update: (cache, { data }) => {
      if (data?.updateUserPrograms) {
        cache.writeQuery({
          query: allUsersAdminQuery,
          data: {
            users: data.updateUserPrograms,
          },
        });
      }
    },
  });
  const deletePrograms = () => {
    updateProgram({
      variables: {
        update_user: {
          email: program.email,
          oldPrograms: program.programs,
          programs: [],
        },
      },
    });
  };

  return (
    <Modal
      trigger={cloneElement(children, {
        onClick: () => setOpen(true),
      })}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      open={open}
    >
      <Modal.Header>
        {program.email}
        {program.programs.length > 0 ? "-" : ""}
        {truncate(program.programs.join(" | "), { length: 50 })}
      </Modal.Header>

      <Modal.Content>
        <Grid centered>
          <Grid.Row>
            <Confirm
              header="¿Está seguro que desea resetear los campos del formulario a los obtenidos desde la base de datos?"
              content="Cualquier cambio en los campos de información va a ser perdido"
            >
              <Button
                circular
                icon
                secondary
                onClick={() => {
                  setSelectedPrograms(program.programs);
                }}
              >
                <Icon circular name="redo" />
              </Button>
            </Confirm>
          </Grid.Row>
          <Grid.Row>
            <Label size="big">{program.email}</Label>
          </Grid.Row>
          <Grid.Row>
            <Label size="big">Programs</Label>
            <Dropdown
              placeholder="Añadir programas"
              fluid
              selection
              multiple
              search
              options={
                allPrograms?.programs.map(({ id: value }) => ({
                  text: value,
                  value,
                })) ?? []
              }
              onChange={(_, { value }) =>
                setSelectedPrograms(value as number[])
              }
              value={selectedPrograms}
            />
          </Grid.Row>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button
          type="submit"
          icon
          labelPosition="left"
          primary
          onClick={() => {
            updateProgram();
            setOpen(false);
          }}
        >
          <Icon name="save outline" />
          Guardar
        </Button>

        <Confirm
          header="¿Está seguro que desea eliminar todos los programa a este usuario?"
          content="Éstos se van a eliminar de la base de datos"
        >
          <Button
            type="button"
            icon
            labelPosition="left"
            color="red"
            onClick={() => {
              deletePrograms();
              setOpen(false);
            }}
          >
            <Icon name="remove circle" />
            Eliminar
          </Button>
        </Confirm>
      </Modal.Actions>
    </Modal>
  );
};
