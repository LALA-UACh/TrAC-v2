import "dotenv/config";
import "reflect-metadata";

import AltairFastify from "altair-fastify-plugin";
import Fastify from "fastify";
import FastifyCookie from "fastify-cookie";
import mercurius from "mercurius";
import helmet from "fastify-helmet";
import FastifyNextJS from "fastify-nextjs";
import { renderVoyagerPage } from "graphql-voyager/middleware";
import ms from "ms";
import { resolve } from "path";

import { COOKIE_SECRET, PORT, SHOW_GRAPHQL_API } from "./api/constants";
import { buildContext } from "./api/core/buildContext";
import { schema } from "./api/core/schema";
import { logger } from "./api/services/logger";
import { IS_DEVELOPMENT, IS_NOT_TEST } from "./client/constants";

export const app = Fastify({
  trustProxy: true,
  pluginTimeout: ms("300 seconds"),
  logger,
});

app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      "default-src": "'self'",
      "style-src":
        "'self' https://cdn.jsdelivr.net https://fonts.googleapis.com 'unsafe-inline'",
      "script-src": IS_DEVELOPMENT
        ? "'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
        : /** 'self' - altair - voyager - cdn */ "'self' 'sha256-US93NNvzxqNwZq4vsTymtyO9e1JOnGB6vGy83vG+uuw=' 'sha256-YxOTuTvyNLHJOis3NYhQFhTdPRWuJIRWCv6cons2/b4=' https://cdn.jsdelivr.net",
      "font-src":
        "'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
      "img-src": `'self' data:`,
      "connect-src":
        "'self' https://cdn.jsdelivr.net https://fonts.googleapis.com",
      "worker-src": "'self' blob:",
      "object-src": "'self' data:",
    },
  },
});

app.register(FastifyCookie, {
  secret: COOKIE_SECRET,
});

if (SHOW_GRAPHQL_API || IS_DEVELOPMENT) {
  app.get("/api/voyager", (_req, res) => {
    res.type("text/html").send(
      renderVoyagerPage({
        endpointUrl: "/api/graphql",
        displayOptions: {
          rootType: undefined,
          skipRelay: false,
          skipDeprecated: true,
          sortByAlphabet: true,
          showLeafFields: true,
          hideRoot: false,
        },
      })
    );
  });

  app.register(AltairFastify, {
    endpointURL: "/api/graphql",
    baseURL: "/api/altair/",
    path: "/api/altair",
  });
}

app.register(mercurius, {
  path: "/api/graphql",
  schema,
  context: buildContext,
  ide: false,
  graphiql: false,
  jit: 1,
  queryDepth: 7,
});

if (IS_NOT_TEST) {
  app
    .register(FastifyNextJS, {
      dir: resolve(process.cwd(), "./client"),
    })
    .after(() => {
      app.next("/*");
    });
}

if (IS_NOT_TEST) {
  app.listen(PORT, "0.0.0.0").then(() => {
    process.send?.("ready");

    if (IS_DEVELOPMENT) {
      const localPath = `http://localhost:${PORT}/`;
      import("axios").then(({ default: { get } }) => {
        get(localPath)
          .then(() => {
            import("open").then(({ default: open }) => {
              open(localPath).catch(console.error);
            });
          })
          .catch(console.error);
      });
    }
  });
}
