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
