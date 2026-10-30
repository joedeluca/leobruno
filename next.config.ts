import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The box runs the standalone server (scripts/deploy.mjs sets LB_STANDALONE); dev doesn't need it.
  ...(process.env.LB_STANDALONE ? { output: "standalone" as const } : {}),
  // The writing is markdown read off disk at request time (lib/posts.ts, lib/poems.ts,
  // lib/newsletter.ts, lib/copywriter.ts, lib/magazine/copy.ts); the bundle has to carry it.
  outputFileTracingIncludes: {
    "/*": ["./posts/**", "./poems/**", "./content/**", "./copywriter/**"],
  },
};

export default nextConfig;
