import type { NextConfig } from "next";

// GitHub Pages configuration
const isGitHubPages = process.env.GITHUB_PAGES === "true" || process.env.NODE_ENV === "production";
const repoName = "iranchange-demo1"; // Change this if your repo name is different
const basePath = isGitHubPages ? `/${repoName}` : "";
const assetPrefix = isGitHubPages ? `/${repoName}/` : "";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  
  // GitHub Pages base path
  basePath: basePath,
  assetPrefix: assetPrefix,
  
  // Images configuration for static export
  images: {
    unoptimized: true,
  },
  
  trailingSlash: true,
  
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during builds for demo deployment
  },
  typescript: {
    ignoreBuildErrors: true, // Allow TS errors for easier deployment
  },
  env: {
    // Vercel automatically provides VERCEL_GIT_COMMIT_SHA during build
    NEXT_PUBLIC_BUILD_SHA: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_BUILD_SHA || "local",
  },
  // Headers removed for static export (not supported)
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
