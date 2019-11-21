import gql from "graphql-tag-ts";
import { createContext, FC, useContext, useEffect } from "react";
import { useLogger } from "react-use";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { trackMutation } from "@graphql/queries";

import { CoursesFlowContext } from "./dashboard/CoursesFlow";

type TrackingTemplateData = {
  program: number;
  curriculum: number;
  student: string;
  showingProgress: boolean;
  showingPrediction: boolean;
  coursesOpen: string;
  action: string;
  effect: string;
  target: string;
}; // TODO: Remove any

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

export const Tracking: FC = () => {
  const coursesFlow = useContext(CoursesFlowContext);
  const { data, error } = useQuery<{
    student: {
      id: string;
      curriculum: number;
    };
    program: {
      id: number;
    };
  }>(
    gql`
      query {
        student {
          id
          curriculum
        }
        program {
          id
        }
      }
    `,
    {
      fetchPolicy: "cache-only",
    }
  );

  const [track] = useMutation(trackMutation);

  useEffect(() => {
    if (data && error) {
      // TODO: Remove "&& error"
      track({
        variables: {
          data: {
            app_id: "TrAC",
            datetime_client: new Date(),
            //@ts-ignore
            data: trackingTemplate({
              program: data.program.id,
              curriculum: data.student.curriculum,
              student: data.student.id,
            }),
          },
        },
      });
    }
  }, [data]);

  useLogger("tracking", {
    data,
    error,
    coursesFlow,
  });
  // const { mutate } = useApolloClient();
  // const track = useCallback(
  //   async ({
  //     app_id = "TrAC",
  //     data,
  //   }: {
  //     app_id?: string;
  //     data: TrackingTemplateData;
  //   }) => {
  //     mutate({
  //       mutation: trackingQuery,
  //       variables: {
  //         data: {
  //           app_id,
  //           data: trackingTemplate(data),
  //           datetime_client: new Date(),
  //         },
  //       },
  //     })
  //       .then(a => {
  //         console.log("61a", a);
  //       })
  //       .catch(e => {
  //         console.log("63e", e);
  //       });
  //   },
  //   [mutate]
  // );

  return null;
};
