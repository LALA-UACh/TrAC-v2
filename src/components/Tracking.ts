import {
  createContext,
  FC,
  MutableRefObject,
  useContext,
  useEffect,
} from "react";

import { useMutation } from "@apollo/react-hooks";

import { TRACK } from "../graphql/queries";

export type TrackingTemplateData = {
  program?: string;
  curriculum?: string;
  student?: string;
  showingProgress?: boolean;
  showingPrediction?: boolean;
  coursesOpen?: string;
  action: string;
  effect: string;
  target: string;
};

export type TrackingRef = Partial<
  Pick<
    TrackingTemplateData,
    | "program"
    | "curriculum"
    | "student"
    | "showingProgress"
    | "showingPrediction"
    | "coursesOpen"
  >
> & {
  track: (data: {
    action: string;
    effect: string;
    target: string;
  }) => Promise<any>;
};

export const TrackingContext = createContext<MutableRefObject<TrackingRef>>({
  current: { track: async () => {} },
});

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
  return `program=${program || null},curriculum=${curriculum ||
    null},student=${student || null},showing-progress=${
    showingProgress ? 1 : 0
  },showing-prediction=${
    showingPrediction ? 1 : 0
  },courses-open=${coursesOpen ||
    null},action=${action},effect=${effect},target=${target}`;
};

export const Tracking: FC<{
  program?: number;
  curriculum?: number;
  student?: string;
}> = () => {
  const TrackingData = useContext(TrackingContext);

  const [trackMutate] = useMutation(TRACK, {
    ignoreResults: true,
  });

  useEffect(() => {
    TrackingData.current.track = async ({ action, effect, target }) => {
      const {
        program,
        curriculum,
        student,
        coursesOpen,
        showingPrediction,
        showingProgress,
      } = TrackingData.current;

      trackMutate({
        variables: {
          data: trackingTemplate({
            program,
            curriculum,
            student,
            coursesOpen,
            showingPrediction,
            showingProgress,
            action,
            effect,
            target,
          }),
          datetime_client: new Date(),
        },
      });
    };
  }, [trackMutate]);

  return null;
};
