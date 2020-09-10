import "../../public/style.css";
import "../../public/nprogress.css";
import "react-toastify/dist/ReactToastify.min.css";
import "react-datepicker/dist/react-datepicker.min.css";

import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import React from "react";
import { ToastContainer } from "react-toastify";

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { theme, ThemeProvider } from "@chakra-ui/core";

import { GRAPHQL_URL, IS_NOT_PRODUCTION } from "../../constants";
import { RefreshToken } from "../components/RefreshToken";
import { Config } from "../context/Config";
import { DarkMode } from "../utils/dynamicDarkMode";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export const client = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_URL,
    includeExtensions: true,
    credentials: "same-origin",
  }),
  cache: new InMemoryCache(),
  connectToDevTools: IS_NOT_PRODUCTION,
});

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
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

export default App;
