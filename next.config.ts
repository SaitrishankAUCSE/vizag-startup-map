import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide Next.js development indicator badge
  devIndicators: false,

  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
