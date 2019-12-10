import { PromiseType } from "utility-types";

import { buildContext } from "../api/utils/buildContext";
import { StateCourse } from "../constants";

export type IContext = PromiseType<ReturnType<typeof buildContext>>;
export type ITakenSemester = {
  year: number;
  term: string;
};
export type IRangeGrade = {
  min: number;
  max: number;
  color: string;
};
export type IDistribution = {
  label: string;
  value: number;
};

export type ITakenCourse = {
  term: string;
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
  historicDistribution: IDistribution[];
  bandColors: { min: number; max: number; color: string }[];

  taken: ITakenCourse[];
};
