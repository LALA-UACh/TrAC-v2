import connect from "connect";
import proxy from "http-proxy-middleware";

const app = connect();

app.use(proxy("http://localhost:4000"));

export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;
