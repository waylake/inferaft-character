import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // stable in 16 — every <Link href> is checked against the route tree
  typedRoutes: true,
  // Cache Components: `use cache` on the character catalog, dynamic islands stay in Suspense
  cacheComponents: true,
  // self-contained server bundle for the production image
  output: "standalone",
};

export default nextConfig;
