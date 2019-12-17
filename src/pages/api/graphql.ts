import connect from "connect";
import proxy from "http-proxy-middleware";
import { toInteger } from "lodash";

const app = connect();

const port = process?.env?.API_PORT ? toInteger(process.env.API_PORT) : 4000;

app.use(proxy(`http://localhost:${port}`));

export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;
