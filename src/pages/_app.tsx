import ApolloClient from "apollo-client";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";

import { ApolloProvider } from "@apollo/react-hooks";
import { theme, ThemeProvider } from "@chakra-ui/core";
import { Tracking } from "@components/Tracking";
import { withApollo } from "@utils/withApollo";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

class MyApp extends App<{ apollo: ApolloClient<any> }> {
  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Tracking>
          <Head>
            <title>TrAC</title>
          </Head>

          <ThemeProvider theme={theme}>
            <Component {...pageProps} />
          </ThemeProvider>
        </Tracking>
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
