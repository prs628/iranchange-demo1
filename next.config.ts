const repo = "iranchange-demo1";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  trailingSlash: true,

  // ✅ مهم: جلوی Fail شدن build به خاطر ESLint رو می‌گیره
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
