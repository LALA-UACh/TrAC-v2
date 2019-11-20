declare module "@vx/axis" {
  import { ScaleLinear } from "d3-scale";
  import React, { ReactText } from "react";

  interface Point {
    x: number;
    y: number;
  }

  interface AxisProps {
    axisClassName?: string;
    axisLineClassName?: string;
    hideAxisLine?: boolean;
    hideTicks?: boolean;
    hideZero?: boolean;
    label?: string;
    labelClassName?: string;
    labelOffset?: number;
    labelProps?: object;
    left?: number;
    numTicks?: number;
    rangePadding?: number;
    scale?: ScaleLinear<any, any>;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    tickClassName?: string;
    tickFormat?: (value: T, index: number) => ReactText;
    tickLabelProps?: (value: any, index: number) => object;
    tickLength?: number;
    tickStroke?: string;
    tickTransform?: string;
    tickValues?: number[];
    tickComponent?:
      | React.ReactNode
      | ((obj: { x: number; y: number; formattedValue: string }) => React.ReactNode);
    top?: number;
    children?: (renderProps: {
      axisFromPoint: Point;
      axisToPoint: Point;
      horizontal: boolean;
      tickSign: 1 | -1;
      numTicks: number;
      label: string;
      rangePadding: number;
      tickLength: number;
      tickFormat: (value: any, index: number) => string;
      tickPosition: (value: number) => number;
      ticks: {
        value: any;
        index: number;
        from: Point;
        to: Point;
        formattedValue: string;
      };
    }) => React.ReactNode;
  }

  const AxisLeft: React.ComponentType<AxisProps>;
  const AxisBottom: React.ComponentType<AxisProps>;
}
