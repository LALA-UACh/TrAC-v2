import { createStore } from "react-state-selector";

export const {
  useStore: useDashboardInputState,
  actions: DashboardInputActions,
  hooks: { useIsMockActive, useProgram, useStudent, useChosenCurriculum },
} = createStore(
  {
    chosenCurriculum: undefined as string | undefined,
    program: undefined as string | undefined,
    student: undefined as string | undefined,
    mock: false,
  },
  {
    devName: "DashboardInput",
    hooks: {
      useProgram: ({ program }) => {
        return program;
      },
      useStudent: ({ student }) => {
        return student;
      },
      useChosenCurriculum: ({ chosenCurriculum }) => {
        return chosenCurriculum;
      },
      useIsMockActive: ({ mock }) => {
        return mock;
      },
    },
    actions: {
      setProgram: (program?: string) => draft => {
        draft.program = program;
      },
      setStudent: (student?: string) => draft => {
        draft.student = student;
      },
      setChosenCurriculum: (chosenCurriculum?: string) => draft => {
        draft.chosenCurriculum = chosenCurriculum;
      },
      setMock: (mock: boolean) => draft => {
        draft.mock = mock;
      },
    },
  }
);
