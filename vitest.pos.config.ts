import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: path.resolve(__dirname, "tests"),
  server: {
    watch: null,
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
