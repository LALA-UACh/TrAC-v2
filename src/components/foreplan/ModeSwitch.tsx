import { FC, useContext } from "react";
import { AiOutlineSchedule } from "react-icons/ai";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";

import { Button } from "@chakra-ui/core";

import { ConfigContext } from "../../context/Config";
import { useIsForeplanActive } from "../../context/ForeplanContext";
import { useTracking } from "../../context/Tracking";

const ForeplanModeSwitch: FC = () => {
  const [
    isForeplanActive,
    { activateForeplan, disableForeplan },
  ] = useIsForeplanActive();
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
  const [, { track }] = useTracking();

  return (
    <Button
      backgroundColor={
        isForeplanActive
          ? FOREPLAN_MODE_SWITCH_ACTIVE_BACKGROUND_COLOR
          : FOREPLAN_MODE_SWITCH_INACTIVE_BACKGROUND_COLOR
      }
      leftIcon={AiOutlineSchedule}
      rightIcon={isForeplanActive ? FaToggleOn : FaToggleOff}
      variantColor="blue"
      color={
        isForeplanActive
          ? FOREPLAN_MODE_SWITCH_ACTIVE_TEXT_COLOR
          : FOREPLAN_MODE_SWITCH_INACTIVE_TEXT_COLOR
      }
      cursor="pointer"
      height={FOREPLAN_MODE_SWITCH_HEIGHT}
      fontSize={FOREPLAN_MODE_SWITCH_FONT_SIZE}
      fontFamily={FOREPLAN_MODE_SWITCH_FONT_FAMILY}
      transition="all 1s"
      onClick={() => {
        if (isForeplanActive) {
          disableForeplan();
          track({
            action: "click",
            effect: "disable_foreplan",
            target: "foreplan_mode_switch_button",
          });
        } else {
          activateForeplan();
          track({
            action: "click",
            effect: "activate_foreplan",
            target: "foreplan_mode_switch_button",
          });
        }
      }}
    >
      {FOREPLAN_MODE_SWITCH_LABEL}
    </Button>
  );
};

export default ForeplanModeSwitch;
