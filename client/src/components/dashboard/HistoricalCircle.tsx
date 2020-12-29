import React, { useContext, useMemo, useState } from "react";

import { Badge } from "@chakra-ui/react";

import { usePopper } from "react-popper";

import { ConfigContext } from "../../context/Config";

export function HistoricalCircle({
  color,
  tooltipLabel,
  tooltipType,
}: {
  color: string;
  tooltipLabel?: string | number;
  tooltipType?: "error" | "info" | "light";
}) {
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<SVGSVGElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLSpanElement | null>(
    null
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {});
  const config = useContext(ConfigContext);

  const tooltipProps = useMemo(() => {
    switch (tooltipType) {
      case "info": {
        return {
          className: "info_popover popover",
          background: "#3182CE",
          color: "white",
        };
      }
      case "error": {
        return {
          className: "error_popover popover",
          background: "#E53E3E",
          color: "white",
        };
      }
      default:
        return {
          className: "white_popover popover",
        };
    }
  }, [tooltipType]);

  const [show, setShow] = useState(false);

  return (
    <>
      <svg
        onMouseOver={() => {
          setShow(true);
        }}
        onMouseLeave={() => {
          setShow(false);
        }}
        ref={setReferenceElement}
        width={16}
        height={16}
      >
        <circle
          cx={8}
          cy={8}
          r={6}
          stroke={config.STATE_COURSE_CIRCLE_STROKE}
          fill={color}
        />
      </svg>

      {show && (
        <Badge
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          {...tooltipProps}
          fontSize="1.1em"
          zIndex={100}
          borderRadius={5}
        >
          {tooltipLabel}
        </Badge>
      )}
    </>
  );
}
