import "../../public/style.css";
import "../../public/nprogress.css";
import "react-datepicker/dist/react-datepicker.min.css";

import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import React from "react";

import {
  ApolloClient,
  ApolloProvider,
  defaultDataIdFromObject,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

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
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        keyFields: ["email"],
      },
    },
    dataIdFromObject(object) {
      switch (object.__typename) {
        case "AuthResult": {
          return "UniqueAuthResult";
        }
        default:
          return defaultDataIdFromObject(object);
      }
    },
  }),
  connectToDevTools: IS_NOT_PRODUCTION,
});

const customTheme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: "light",
  },
});

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  return (
    <ApolloProvider client={client}>
      <Head>
        <title>TrAC</title>
      </Head>
      <ChakraProvider theme={customTheme}>
        <Config>
          <Component {...pageProps} />
        </Config>

        <DarkMode render={false} />
        <RefreshToken />
      </ChakraProvider>
    </ApolloProvider>
  );
};

export default App;
