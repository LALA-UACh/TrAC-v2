import { createProxyMiddleware } from "http-proxy-middleware";
import { toInteger } from "lodash";
import { PageConfig } from "next";

const silentWarn = (message: any) => {
  if (!message?.includes("API resolved without sending a response")) {
    console.error(message);
  }
};
console.warn = silentWarn;

const port = process.env.API_PORT ? toInteger(process.env.API_PORT) : 4000;

export default createProxyMiddleware(`http://localhost:${port}`);

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
