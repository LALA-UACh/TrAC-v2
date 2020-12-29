import { createStore } from "react-state-selector";

export const {
  hooks: { useIsMockActive },
  actions: { setMock },
} = createStore(
  {
    mock: 0,
  },
  {
    storagePersistence: {
      isActive: true,
      persistenceKey: "MockIsActive",
    },
    hooks: {
      useIsMockActive({ mock }) {
        return Boolean(mock);
      },
    },
    actions: {
      setMock: (mock: boolean) => (draft) => {
        draft.mock = mock ? 1 : 0;
      },
    },
  }
);

export const {
  useStore: useDashboardInputState,
  actions: DashboardInputActions,
  hooks: { useProgram, useStudent, useChosenCurriculum },
} = createStore(
  {
    chosenCurriculum: undefined as string | undefined,
    program: undefined as string | undefined,
    student: undefined as string | undefined,
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
    },
    actions: {
      setProgram: (program?: string) => (draft) => {
        draft.program = program;
      },
      setStudent: (student?: string) => (draft) => {
        draft.student = student;
      },
      setChosenCurriculum: (chosenCurriculum?: string) => (draft) => {
        draft.chosenCurriculum = chosenCurriculum;
      },
    },
  }
);
