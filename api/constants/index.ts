import { toInteger } from "lodash";
import ms from "ms";

import { NODE_ENV } from "../../client/constants";

export const SECRET =
  process.env.SECRET ??
  (() => {
    if (NODE_ENV !== "test") {
      console.warn('Please use the "SECRET" environment variable!');
    }
    return "Vzu93jvOF8huLwqw1u2JOZN1FYc5MRbxQgbKgId";
  })();
export const COOKIE_SECRET =
  process.env.COOKIE_SECRET ??
  (() => {
    if (NODE_ENV !== "test") {
      console.warn('Please use the "COOKIE_SECRET" environment variable!');
    }
    return "XnYEnqAjpw68vqkG762y7BgX2WkJeG6euVoVWYBk8fHUzeia2W";
  })();

export const ONE_DAY = ms("1 day");
export const THIRTY_MINUTES = ms("30 mins");
export const ADMIN = "admin";
export const IS_PM2 =
  "PM2_HOME" in process.env ||
  "PM2_JSON_PROCESSING" in process.env ||
  "PM2_CLI" in process.env;
export const PM2_APP_NAME = "trac_app";

export const SHOW_GRAPHQL_API = !!process.env.SHOW_GRAPHQL_API;

export const PORT = process.env.PORT ? toInteger(process.env.PORT) : 3000;
