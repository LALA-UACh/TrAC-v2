declare module "react-indiana-drag-scroll" {
import * as React from "react";

    declare const ScrollContainer: React.FC<{
    vertical?: boolean;
    horizontal?: boolean;
    hideScrollbars?: boolean;
    activationDistance?: number;
    children?: React.ReactNode;
    onStartScroll?: (
      scrollLeft: number,
      scrollTop: number,
      scrollWidth: number,
      scrollHeight: number
    ) => void;
    onEndScroll?: (
      scrollLeft: number,
      scrollTop: number,
      scrollWidth: number,
      scrollHeight: number
    ) => void;
    className?: string;
    style?: React.CSSProperties;
    ignoreElements?: string;
    nativeMobileScroll?: boolean;
  }>;

  export default ScrollContainer;
}
