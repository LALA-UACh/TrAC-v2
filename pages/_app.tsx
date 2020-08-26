import "../public/style.css";
import "../public/nprogress.css";
import "react-toastify/dist/ReactToastify.min.css";
import "react-datepicker/dist/react-datepicker.min.css";

import { NextPage } from "next";
import { withSecureHeaders } from "next-secure-headers";
import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { theme, ThemeProvider } from "@chakra-ui/core";

import { GRAPHQL_URL, IS_NOT_PRODUCTION, NODE_ENV } from "../constants";
import { RefreshToken } from "../src/components/RefreshToken";
import { Config } from "../src/context/Config";
import { DarkMode } from "../src/utils/dynamicDarkMode";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  const [client, setClient] = useState<ApolloClient<any>>();

  useEffect(() => {
    setClient(
      new ApolloClient({
        link: new HttpLink({
          uri: GRAPHQL_URL,
          includeExtensions: true,
          credentials: "same-origin",
        }),
        cache: new InMemoryCache(),
        connectToDevTools: IS_NOT_PRODUCTION,
      })
    );
  }, []);

  if (client == null) return null;

  return (
    <ApolloProvider client={client}>
      <Head>
        <title>TrAC</title>
      </Head>

      <ThemeProvider theme={theme}>
        <Config>
          <Component {...pageProps} />
        </Config>
      </ThemeProvider>
      <DarkMode render={false} />
      <RefreshToken />
      <ToastContainer toastClassName="toast" />
    </ApolloProvider>
  );
};

const AppPage = withSecureHeaders({
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
        NODE_ENV !== "development"
          ? ["'self'"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
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
})(App);

export default AppPage;
