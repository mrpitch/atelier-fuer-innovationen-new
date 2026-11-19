import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // The default image loader needs a server; a static export can't use it.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
