import path from "path";
import { defineConfig } from "vitest/config";
import { buildVitestWatchIgnored } from "./vitest.watch-ignored";

export default defineConfig({
  root: path.resolve(__dirname, "tests"),
  server: {
    watch: {
      ignoreInitial: true,
      usePolling: true,
      interval: 1000,
      ignored: buildVitestWatchIgnored(__dirname),
    },
  },
  test: {
    environment: "node",
    watch: false,
    include: [
      "unit/actions-pos-rbac.test.ts",
      "unit/pos-workspace-permissions.test.ts",
      "unit/pos-subnav-links.test.ts",
      "unit/pos-terminal-route.test.ts",
    ],
    globals: false,
    fileParallelism: false,
    maxWorkers: 1,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "tests/mocks/server-only.ts"),
    },
  },
});
