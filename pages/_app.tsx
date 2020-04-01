import "../public/style.css";
import "../public/nprogress.css";
import "react-toastify/dist/ReactToastify.min.css";

import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { NextPage } from "next";
import withSecureHeaders from "next-secure-headers";
import withApollo, { WithApolloProps } from "next-with-apollo";
import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import React from "react";
import { ToastContainer } from "react-toastify";

import { ApolloProvider } from "@apollo/react-hooks";
import { theme, ThemeProvider } from "@chakra-ui/core";

import { GRAPHQL_URL, NODE_ENV } from "../constants";
import { Config } from "../src/context/Config";
import { DarkMode } from "../src/utils/dynamicDarkMode";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

declare module "next" {
  export interface NextPageContext {
    apolloClient: ApolloClient<NormalizedCacheObject>;
  }
}

const App: NextPage<AppProps & WithApolloProps<NormalizedCacheObject>> = ({
  Component,
  pageProps,
  apollo,
}) => {
  return (
    <ApolloProvider client={apollo}>
      <Head>
        <title>TrAC</title>
      </Head>

      <ThemeProvider theme={theme}>
        <Config>
          <Component {...pageProps} />
        </Config>
      </ThemeProvider>
      <DarkMode render={false} />
      <ToastContainer toastClassName="toast" />
    </ApolloProvider>
  );
};

export default withSecureHeaders({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com",
        "'unsafe-inline'",
      ],
      scriptSrc:
        NODE_ENV !== "development" ? ["'self'"] : ["'self'", "'unsafe-inline'"],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net",
        "data:;",
      ],
      imgSrc: ["'self'", "data:;"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
    },
    // reportOnly: true,
  },
})(
  withApollo(({ initialState }) => {
    return new ApolloClient({
      link: new HttpLink({
        uri: GRAPHQL_URL,
        includeExtensions: true,
        credentials: "same-origin",
      }),
      cache: new InMemoryCache({}).restore(initialState || {}),
      connectToDevTools: NODE_ENV !== "production",
    });
  })(App)
);
