import { reduce } from "lodash";
import { FC, useCallback, useEffect } from "react";
import { createHook, createStore } from "react-sweet-state";

import { useMutation } from "@apollo/react-hooks";

import { TRACK } from "../graphql/queries";
import { useUser } from "../utils/useUser";

type TrackingTemplateData = {
  program?: string;
  program_menu?: string;
  curriculum?: string;
  student?: string;
  showingProgress?: boolean;
  showingPrediction?: boolean;
  coursesOpen?: string;
  action?: string;
  effect?: string;
  target?: string;
};

const TrackingStore = createStore({
  initialState: {} as TrackingTemplateData,
  actions: {
    setTrackingData: (
      data: Omit<TrackingTemplateData, "action" | "effect" | "target">
    ) => ({ setState }) => {
      setState(data);
    },
    track: (data: { action: string; effect: string; target: string }) => ({
      setState,
    }) => {
      setState(data);
    },
  },
});

const useTrackingStore = createHook(TrackingStore);
export const useTracking = createHook(TrackingStore, {
  selector: null,
});

export const TrackingManager: FC = () => {
  const [state] = useTrackingStore();

  const { user } = useUser({
    fetchPolicy: "cache-only",
  });

  const trackingTemplate = useCallback(
    ({
      program,
      program_menu,
      curriculum,
      student,
      showingProgress,
      showingPrediction,
      coursesOpen,
      action,
      effect,
      target,
    }: TrackingTemplateData) => {
      return `program=${program || null},program-menu=${program_menu ||
        null},curriculum=${curriculum || null},student=${student ||
        null},showing-progress=${showingProgress ? 1 : 0},showing-prediction=${
        showingPrediction ? 1 : 0
      },courses-open=${coursesOpen || null},user-config=${reduce(
        user?.config ?? {},
        (acum, value, key) => {
          if (value) {
            acum = acum + "|" + key;
          }
          return acum;
        },
        ""
      ) ?? ""},action=${action},effect=${effect},target=${target}`;
    },
    [user]
  );

  const [trackMutate] = useMutation(TRACK, {
    ignoreResults: true,
  });

  const trackAction = `${state.action || ""}${state.effect ||
    ""}${state.target || ""}`;

  useEffect(() => {
    if (trackAction) {
      const data = trackingTemplate(state);
      trackMutate({
        variables: {
          data,
          datetime_client: new Date(),
        },
      }).catch(err => {
        console.error(JSON.stringify(err, null, 2));
      });
    }
  }, [trackAction]);
  return null;
};
