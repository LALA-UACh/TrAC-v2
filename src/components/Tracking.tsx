import { createContext, FC, useCallback } from "react";

import { useApolloClient } from "@apollo/react-hooks";
import { trackingQuery } from "@graphql/queries";

type TrackingTemplateData = {
  program: string;
  curriculum: string;
  student: string;
  showingProgress: boolean;
  showingPrediction: boolean;
  coursesOpen: string;
  action: string;
  effect: string;
  target: string;
};

const trackingTemplate = ({
  program,
  curriculum,
  student,
  showingProgress,
  showingPrediction,
  coursesOpen,
  action,
  effect,
  target,
}: TrackingTemplateData) => {
  return `program=${program},curriculum=${curriculum},student=${student},showing-progress=${
    showingProgress ? 1 : 0
  },showing-prediction=${
    showingPrediction ? 1 : 0
  },courses-open=${coursesOpen},action=${action},effect=${effect},target=${target}`;
};

export const TrackingContext = createContext<{
  track: (data: {
    app_id?: string;
    data: TrackingTemplateData;
  }) => Promise<any>;
}>({ track: async () => {} });

export const Tracking: FC = ({ children }) => {
  const { mutate } = useApolloClient();
  const track = useCallback(
    async ({
      app_id = "TrAC",
      data,
    }: {
      app_id?: string;
      data: TrackingTemplateData;
    }) => {
      mutate({
        mutation: trackingQuery,
        variables: {
          data: {
            app_id,
            data: trackingTemplate(data),
            datetime_client: new Date(),
          },
        },
      })
        .then(a => {
          console.log("61a", a);
        })
        .catch(e => {
          console.log("63e", e);
        });
    },
    [mutate]
  );

  return (
    <TrackingContext.Provider value={{ track }}>
      {children}
    </TrackingContext.Provider>
  );
};
