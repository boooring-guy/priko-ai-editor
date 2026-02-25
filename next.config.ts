import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "priko-bucket-dev.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: ["tunnel.pro-track.app", "localhost:3000"],
};

export default nextConfig;
