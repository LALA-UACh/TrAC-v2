import { StateCourse } from "@constants";
import { buildContext } from "@utils/buildContext";

export type IContext = ReturnType<typeof buildContext>;
export type ISemesterTaken = {
  year: number;
  semester: string;
};
export type IRangeGrade = {
  min: number;
  max: number;
  color: string;
};
export type IDistribution = {
  min: number;
  max: number;
  value: number;
};
export type ICourse = {
  name: string;
  code: string;
  credits: { label: string; value: number }[];
  flow: string[];
  requisites: string[];
  //  ↑ Static course info
  //  ↓ Taken course info
  registration?: string;
  grade?: number;
  state?: StateCourse;
  semestersTaken: {
    year: number;
    semester: string;
  }[];
  currentDistributionLabel?: string;
  historicalStates: {
    state: StateCourse;
    grade: number;
    semester: number;
    year: number;
  }[];
  historicDistribution?: IDistribution[];
  currentDistribution?: IDistribution[];
};
