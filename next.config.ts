import { createRequire } from "node:module";
import path from "node:path";
import type { NextConfig } from "next";

import { storefrontImageRemotePatterns } from "@/lib/storefront/image-cdn-config";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  staticPageGenerationTimeout: 120,
  serverExternalPackages: ["stripe"],
  webpack: (config, { nextRuntime }) => {
    // @supabase/storage-js imports iceberg-js; Edge/middleware bundling can fail to resolve nested hoists.
    try {
      const icebergRoot = path.dirname(require.resolve("iceberg-js/package.json"));
      config.resolve.alias = {
        ...config.resolve.alias,
        "iceberg-js": icebergRoot,
      };
    } catch {
      // install incomplete — `npm install` should restore iceberg-js
    }

    // Middleware (Edge): avoid snarkjs / child_process and heavy node:crypto paths in the experiment graph.
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/lib/experiment-production/zk-groth16-prover": path.join(
          process.cwd(),
          "lib/experiment-production/zk-groth16-prover.edge.ts",
        ),
        "@/lib/storefront/theme-experiment-quantum-safe": path.join(
          process.cwd(),
          "lib/storefront/theme-experiment-quantum-safe-edge.ts",
        ),
      };
    }

    return config;
  },
  images: {
    remotePatterns: storefrontImageRemotePatterns(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
    // Reduce parallel SSG — lowers peak RAM on Vercel (655+ static paths).
    staticGenerationMaxConcurrency: process.env.VERCEL
      ? Number(process.env.NEXT_STATIC_GENERATION_MAX_CONCURRENCY ?? 1)
      : 2,
    // Fewer webpack workers on remote builders to avoid OOM alongside SSG.
    ...(process.env.VERCEL ? { cpus: 1 as const } : {}),
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://*.vercel.app",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com",
      "frame-src https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Dashboard theme/preview iframes embed same-origin storefront routes.
      {
        source: "/s/:path*",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;
