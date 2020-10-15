import { StateCourse } from "../client/constants";

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
  equiv: string;
  registration?: string;
  grade?: number;
  state?: StateCourse;
  currentDistribution?: IDistribution[];
  parallelGroup?: number;
  bandColors?: { min: number; max: number; color: string }[];
};

export type ICourse = {
  code: string;
  name: string;
  credits: { label: string; value: number }[];
  flow: string[];
  requisites: string[];
  historicDistribution: IDistribution[];
  taken: ITakenCourse[];
  bandColors: { min: number; max: number; color: string }[];
};

export * from "./utils";
