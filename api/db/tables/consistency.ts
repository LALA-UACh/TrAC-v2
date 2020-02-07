import { dbAuth } from "../";

export const CONSISTENCY_TABLE = "consistency";

export interface IConsistency {
  user: string;

  key: string;

  data: Record<string, any>;
}

export const ConsistencyTable = () => dbAuth<IConsistency>(CONSISTENCY_TABLE);
