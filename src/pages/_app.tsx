import ApolloClient from "apollo-client";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import React from "react";

import { ApolloProvider } from "@apollo/react-hooks";
import { theme, ThemeProvider } from "@chakra-ui/core";

import { Config } from "../components/Config";
import { withApollo } from "../utils/withApollo";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

class MyApp extends App<{ apollo: ApolloClient<any> }> {
  render() {
    const { Component, pageProps, apollo } = this.props;

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
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
