import { State } from "@constants";
import { buildContext } from "@utils/buildContext";

export type IContext = ReturnType<typeof buildContext>;
export type ISemesterTaken = { year: number; semester: string };
export type IRangeGrade = { min: number; max: number; color: string };
export type IDistribution = { min: number; max: number; value: number };
export type ICourse = {
  name: string;
  code: string;
  credits: number;
  flow: string[];
  requisites: string[];
  registration?: string;
  grade?: number;
  state?: State;
  semestersTaken: { year: number; semester: string }[];
  currentDistributionLabel?: string;
  historicalStates: { state: State; grade: number }[];
  historicDistribution?: IDistribution[];
  currentDistribution?: IDistribution[];
};
