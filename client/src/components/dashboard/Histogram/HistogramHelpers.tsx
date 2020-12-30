import { scaleLinear } from "d3-scale";

export function averageTwo(a: number | undefined, b: number | undefined) {
  return ((a ?? b ?? 0) + (b ?? a ?? 0)) / 2;
}

export const scaleColorX = scaleLinear();

export const scaleAxisX = scaleLinear();
