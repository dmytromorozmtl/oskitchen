import { createRequire } from "node:module";
import path from "node:path";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

import { storefrontImageRemotePatterns } from "@/lib/storefront/image-cdn-config";
import { resolveStaticGenerationMaxConcurrency } from "@/lib/performance/static-generation-concurrency-policy";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
  analyzerMode: "json",
});

const staticGenerationMaxConcurrency = resolveStaticGenerationMaxConcurrency();

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  staticPageGenerationTimeout: 120,
  serverExternalPackages: ["stripe"],
  ...(process.env.SKIP_TYPECHECK === "1"
    ? {
        typescript: { ignoreBuildErrors: true },
        eslint: { ignoreDuringBuilds: true },
      }
    : {}),
  webpack: (config, { nextRuntime, dev }) => {
    // Remote Vercel builds: disable persistent webpack cache (log spam hits 4 MB build log limit).
    if (process.env.VERCEL && !dev) {
      config.cache = false;
      config.infrastructureLogging = { level: "error" };
    }

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
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-icons",
    ],
    serverActions: {
      bodySizeLimit: "4mb",
      // Custom domain + Vercel previews: Origin/Host must match or actions abort (CSRF guard).
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "os-kitchen.com",
        "www.os-kitchen.com",
        "*.vercel.app",
      ],
    },
    // Vercel only: concurrency=1 OOM guard (655+ SSG paths). Local uses Next default unless env set.
    ...(staticGenerationMaxConcurrency != null
      ? { staticGenerationMaxConcurrency }
      : {}),
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
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://*.ingest.sentry.io https://*.sentry.io",
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

const configWithAnalyzer = withBundleAnalyzer(nextConfig);

export default withSentryConfig(configWithAnalyzer, {
  org: process.env.SENTRY_ORG ?? "os-kitchen",
  project: process.env.SENTRY_PROJECT ?? "os-kitchen",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
    reactComponentAnnotation: { enabled: true },
  },
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
