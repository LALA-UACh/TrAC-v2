import { dbTracking } from "../";

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
