import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { BatchHttpLink } from "apollo-link-batch-http";
import nextWithApollo from "next-with-apollo";

import { GRAPHQL_URL } from "../../constants";

declare module "next" {
  export interface NextPageContext {
    apolloClient: ApolloClient<NormalizedCacheObject>;
  }
}

export const withApollo = nextWithApollo(({ initialState }) => {
  return new ApolloClient({
    link: new BatchHttpLink({
      uri: GRAPHQL_URL,
      batchInterval: 50,
      includeExtensions: true,
      credentials: "same-origin",
    }),
    cache: new InMemoryCache({}).restore(initialState || {}),
    connectToDevTools: process.env.NODE_ENV !== "production",
  });
});
