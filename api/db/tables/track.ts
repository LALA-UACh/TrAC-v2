import { dbTracking } from "../";

import type { FeedbackQuestionType } from "../../../client/constants";

export interface ITrack {
  id: number;

  app_id: string;

  user_id: string;

  datetime: Date;

  datetime_client: Date;

  data: string;
}

export const TRACKING_TABLE = "tracking";

export const TrackingTable = () => dbTracking<ITrack>(TRACKING_TABLE);

export interface IFeedbackForm {
  id: number;

  name: string;

  priority: number;
}

export const FEEDBACK_FORM_TABLE = "feedback_form";

export const FeedbackFormTable = () =>
  dbTracking<IFeedbackForm>(FEEDBACK_FORM_TABLE);

export interface IFeedbackFormQuestion {
  form_id: number;

  id: number;

  question: string;

  type: FeedbackQuestionType;

  priority: number;

  options: string;
}

export const FEEDBACK_FORM_QUESTION_TABLE = "feedback_form_question";

export const FeedbackFormQuestionTable = () =>
  dbTracking<IFeedbackFormQuestion>(FEEDBACK_FORM_QUESTION_TABLE);

export interface IFeedbackResult {
  form_id: number;

  question_id: number;

  user_id: string;

  answer: string;

  timestamp: Date;
}

export const FEEDBACK_RESULT_TABLE = "feedback_result";

export const FeedbackResultTable = () =>
  dbTracking<IFeedbackResult>(FEEDBACK_RESULT_TABLE);
