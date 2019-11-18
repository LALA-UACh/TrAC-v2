import { AdminContext, IProgram } from "@components/admin/Context";
import Confirm from "@components/admin/Programs/updateProgram/node_modules/@Components/Confirm";
import {
    cloneElement, FunctionComponent, useContext, useEffect
} from "@components/admin/Programs/updateProgram/node_modules/react";
import {
    Field, Form
} from "@components/admin/Programs/updateProgram/node_modules/react-final-form";
import {
    Button, Form as FormSemantic, Grid, Icon, Input, Modal
} from "@components/admin/Programs/updateProgram/node_modules/semantic-ui-react";
import {
    useRememberState
} from "@components/admin/Programs/updateProgram/node_modules/use-remember-state";

const UpdateProgram: FunctionComponent<{
  program: IProgram;
  children: JSX.Element;
}> = ({ children, program }) => {
  const [open, setOpen] = useRememberState(
    `AdminUpdateProgramOpen.${program.email}-${program.program}`,
    false
  );

  useEffect(() => {
    setOpen(
      JSON.parse(
        localStorage.getItem(
          `AdminUpdateProgramOpen.${program.email}-${program.program}`
        ) || "false"
      )
    );
  }, [program.email, program.program]);

  const { updateProgram, deleteProgram } = useContext(AdminContext);

  return (
    <Modal
      trigger={cloneElement(children, {
        onClick: () => setOpen(true)
      })}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      open={open}
    >
      <Modal.Header>
        {program.email}-{program.program}
      </Modal.Header>

      <Form
        onSubmit={(newProgram: IProgram) => {
          updateProgram(program, newProgram);
          setOpen(false);
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
                  top: "0.5em"
                }}
                onClick={() => {
                  reset(program);
                }}
                disabled={pristine}
              >
                <Icon circular name="redo" />
              </Button>
            </Confirm>
            <Grid centered>
              <FormSemantic onSubmit={handleSubmit}>
                <Field name="email" initialValue={program.email}>
                  {({ input }) => (
                    <FormSemantic.Field>
                      <label>Email</label>
                      <Input {...input} />
                    </FormSemantic.Field>
                  )}
                </Field>
                <Field name="program" initialValue={program.program}>
                  {({ input }) => (
                    <FormSemantic.Field>
                      <label>Programa</label>
                      <Input {...input} />
                    </FormSemantic.Field>
                  )}
                </Field>

                <Button
                  type="submit"
                  icon
                  labelPosition="left"
                  primary
                  disabled={pristine}
                >
                  <Icon name="save outline" />
                  Guardar
                </Button>

                <Confirm
                  header="¿Está seguro que desea eliminar este programa?"
                  content="Éste se va a eliminar de la base de datos"
                >
                  <Button
                    type="button"
                    icon
                    labelPosition="left"
                    color="red"
                    onClick={() => {
                      deleteProgram(program);
                      setOpen(false);
                    }}
                  >
                    <Icon name="remove circle" />
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

export default UpdateProgram;
