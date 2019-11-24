require("dotenv").config();

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE !== undefined,
});

module.exports = withBundleAnalyzer({
  env: {
    DOMAIN: process.env.DOMAIN,
  },
  webpack: (config, options) => {
    if (config.resolve.plugins) {
      config.resolve.plugins.push(new TsconfigPathsPlugin());
    } else {
      config.resolve.plugins = [new TsconfigPathsPlugin()];
    }

    return config;
  },
  target: "serverless",
});
