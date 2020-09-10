import { createFastifyGQLTestClient } from "fastify-gql-integration-testing";

import { app } from "../../app";

import type { IncomingHttpHeaders } from "http";

export const testClient = async ({
  headers,
}: { headers?: IncomingHttpHeaders } = {}) => {
  const client = createFastifyGQLTestClient(app);

  if (headers) {
    client.setHeaders(headers);
  }

  return client;
};
