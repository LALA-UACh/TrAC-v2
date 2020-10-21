import { createMercuriusTestClient } from "mercurius-integration-testing";

import { app } from "../../app";

import type { IncomingHttpHeaders } from "http";

export const testClient = async ({
  headers,
}: { headers?: IncomingHttpHeaders } = {}) => {
  const client = createMercuriusTestClient(app, {
    headers,
    url: "/api/graphql",
  });

  return client;
};
