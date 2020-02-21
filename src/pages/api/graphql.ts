import connect, { SimpleHandleFunction } from "connect";
import { createProxyMiddleware } from "http-proxy-middleware";
import { toInteger } from "lodash";

const app = connect();

const silentWarn = (message: any) => {
  if (
    message !==
    "API resolved without sending a response for /api/graphql, this may result in stalled requests."
  ) {
    console.error(message);
  }
};
console.warn = silentWarn;

const port = process?.env?.API_PORT ? toInteger(process.env.API_PORT) : 4000;

app.use(
  createProxyMiddleware(`http://localhost:${port}`) as SimpleHandleFunction
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;
