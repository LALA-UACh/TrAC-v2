require("dotenv").config();
const webpack = require("webpack");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE !== undefined,
});

module.exports = withBundleAnalyzer({
  env: {
    DOMAIN: process.env.DOMAIN,
  },
  webpack: (config, options) => {
    const typeGraphQlShim = new webpack.NormalModuleReplacementPlugin(
      /type-graphql$/,
      (resource) => {
        resource.request = resource.request.replace(
          /type-graphql/,
          "type-graphql/dist/browser-shim"
        );
      }
    );
    if (config.plugins) {
      config.plugins.push(typeGraphQlShim);
    } else {
      config.plugins = [typeGraphQlShim];
    }
    return config;
  },
  target: "serverless",
  poweredByHeader: false,
});
