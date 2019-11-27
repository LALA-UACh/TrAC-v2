require("dotenv").config();

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE !== undefined,
});

module.exports = withBundleAnalyzer({
  env: {
    DOMAIN: process.env.DOMAIN,
  },
  webpack: (config, options) => {
    return config;
  },
  target: "serverless",
});
