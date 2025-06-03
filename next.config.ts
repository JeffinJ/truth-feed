import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images:{
    remotePatterns:[
      {
        protocol: "https",
        hostname: "static-assets-1.truthsocial.com",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "truthsocial.com",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname:"truth-feed.vercel.app",
        port: "",
        pathname: "/**"
      }

    ]
  }
};

export default nextConfig;
// https://truth-feed.vercel.app