/**
 * Helper function to get asset path with basePath
 * Use this for static assets like images, logos, etc.
 */
export function getAssetPath(path: string): string {
  // For GitHub Pages, we need to add the basePath
  // Check if we're in a static export build or production
  const isProduction = process.env.NODE_ENV === "production";
  const isGitHubPages = process.env.GITHUB_PAGES === "true" || isProduction;
  
  // Base path for GitHub Pages
  const basePath = isGitHubPages ? "/iranchange-demo1" : "";
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // Return path with basePath
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
}
