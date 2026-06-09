import path from "path";
import { defineConfig } from "vitest/config";
import { buildVitestWatchIgnored } from "./vitest.watch-ignored";

export default defineConfig({
  server: {
    // Large repo roots can make Vite's default watcher startup dominate simple local test runs.
    watch: {
      ignoreInitial: true,
      usePolling: true,
      interval: 1000,
      ignored: buildVitestWatchIgnored(__dirname),
    },
  },
  test: {
    dir: "tests",
    globalSetup: ["./scripts/materialize-vitest-disk-paths.ts"],
    environment: "node",
    /** Era governance UI/orchestrator slices scan large repo trees; allow headroom under parallel CI load. */
    testTimeout: 120_000,
    watch: false,
    include: [
      "unit/**/*.test.ts",
      "integration/**/*.integration.test.ts",
      "performance/**/*.test.ts",
      "contracts/**/*.test.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/.git/**",
      "e2e/**",
      "playwright-report/**",
      "coverage/**",
      "docs/**",
      "archive/**",
      "artifacts/**",
      ".vercel/**",
      ".deploy-logs/**",
      "test-results/**",
    ],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["lib/**/*.ts", "services/**/*.ts", "actions/**/*.ts"],
      exclude: ["**/*.test.ts", "**/node_modules/**"],
      /** Baseline lock (~21% global); raise toward 60% in dedicated QA sprint. */
      thresholds: {
        lines: 20,
        statements: 20,
        branches: 18,
        functions: 26,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "tests/mocks/server-only.ts"),
    },
  },
});
