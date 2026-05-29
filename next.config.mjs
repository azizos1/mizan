// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      "mock-aws-s3": false,
      "aws-sdk": false,
      nock: false,
    };
    return config;
  },
};

export default nextConfig;