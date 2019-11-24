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

export type ITakenCourse = {
  semester: string;
  year: number;
  registration?: string;
  grade?: number;
  state?: StateCourse;
  currentDistribution?: IDistribution[];
  parallelGroup?: number;
};

export type ICourse = {
  code: string;
  name: string;
  credits: { label: string; value: number }[];
  flow: string[];
  requisites: string[];
  historicDistribution?: IDistribution[];

  taken: ITakenCourse[];
};
