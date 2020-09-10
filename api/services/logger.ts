import pino, { LevelWithSilent, stdTimeFunctions } from "pino";

import { IS_NOT_TEST, IS_PRODUCTION } from "../../client/constants";

export const logger = pino({
  level: "info" as LevelWithSilent,
  base: {},
  prettyPrint: IS_PRODUCTION
    ? false
    : {
        colorize: true,
      },
  timestamp: stdTimeFunctions.isoTime,
  enabled: IS_NOT_TEST,
});
