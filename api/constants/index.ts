import ms from "ms";

import { NODE_ENV } from "../../constants";

export const SECRET =
  process.env.SECRET ??
  (() => {
    if (NODE_ENV !== "test") {
      console.warn('Please use the "SECRET" environment variable!');
    }
    return "Vzu93jvOF8huLwqw1u2JOZN1FYc5MRbxQgbKgId";
  })();
export const ONE_DAY = ms("1 day");
export const THIRTY_MINUTES = ms("30 mins");
export const ADMIN = "admin";
export const IS_PM2 =
  "PM2_HOME" in process.env ||
  "PM2_JSON_PROCESSING" in process.env ||
  "PM2_CLI" in process.env;
export const PM2_APP_NAME = "trac_app";
