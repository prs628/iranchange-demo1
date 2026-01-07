import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during builds for demo deployment
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TS checking, but allow ESLint to be ignored
  },
  env: {
    // Vercel automatically provides VERCEL_GIT_COMMIT_SHA during build
    NEXT_PUBLIC_BUILD_SHA: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_BUILD_SHA || "local",
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  // Transpile Prisma Client
  transpilePackages: ['@prisma/client'],
  webpack: (config, { isServer, webpack }) => {
    // Allow importing .ts files from node_modules/.prisma/client
    config.resolve.extensions.push('.ts', '.tsx');
    
    // Expose BUILD_SHA to client-side via DefinePlugin
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NEXT_PUBLIC_BUILD_SHA': JSON.stringify(
            process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_BUILD_SHA || "local"
          ),
        })
      );
    }
    
    // Make sure .prisma/client TypeScript files are transpiled
    if (isServer) {
      // Add rule to transpile Prisma Client TypeScript files
      config.module.rules.push({
        test: /\.tsx?$/,
        include: [
          /node_modules\/\.prisma\/client/,
          /node_modules\/@prisma\/client/,
        ],
        use: {
          loader: 'next/dist/compiled/babel/loader',
          options: {
            presets: ['next/babel'],
            plugins: [],
          },
        },
      });
    }
    
    return config;
  },
};

export default nextConfig;
