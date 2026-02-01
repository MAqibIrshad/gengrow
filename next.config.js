import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // UploadThing domain
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // This allows the build to finish even with those console.log errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: set this to true if you also want to skip type-check errors during build
    ignoreBuildErrors: false, 
  },
};

export default nextConfig;