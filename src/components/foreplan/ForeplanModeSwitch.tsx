import { FC, useContext } from "react";

import { Button } from "@chakra-ui/core";

import { ConfigContext } from "../Config";
import { ForeplanContext } from "./ForeplanContext";

const ForeplanModeSwitch: FC = () => {
  const { active, dispatch } = useContext(ForeplanContext);
  const {
    FOREPLAN_MODE_SWITCH_LABEL,
    FOREPLAN_MODE_SWITCH_ACTIVE_BACKGROUND_COLOR,
    FOREPLAN_MODE_SWITCH_INACTIVE_BACKGROUND_COLOR,
    FOREPLAN_MODE_SWITCH_ACTIVE_TEXT_COLOR,
    FOREPLAN_MODE_SWITCH_INACTIVE_TEXT_COLOR,
    FOREPLAN_MODE_SWITCH_HEIGHT,
    FOREPLAN_MODE_SWITCH_FONT_FAMILY,
    FOREPLAN_MODE_SWITCH_FONT_SIZE,
  } = useContext(ConfigContext);
  return (
    <Button
      backgroundColor={
        active
          ? FOREPLAN_MODE_SWITCH_ACTIVE_BACKGROUND_COLOR
          : FOREPLAN_MODE_SWITCH_INACTIVE_BACKGROUND_COLOR
      }
      variantColor="blue"
      color={
        active
          ? FOREPLAN_MODE_SWITCH_ACTIVE_TEXT_COLOR
          : FOREPLAN_MODE_SWITCH_INACTIVE_TEXT_COLOR
      }
      cursor="pointer"
      height={FOREPLAN_MODE_SWITCH_HEIGHT}
      fontSize={FOREPLAN_MODE_SWITCH_FONT_SIZE}
      fontFamily={FOREPLAN_MODE_SWITCH_FONT_FAMILY}
      transition="all 1s"
      onClick={() => {
        dispatch({
          type: active ? "disableForeplan" : "activateForeplan",
        });
      }}
    >
      {FOREPLAN_MODE_SWITCH_LABEL}
    </Button>
  );
};

export default ForeplanModeSwitch;
