import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.integration.test.ts",
      "tests/contracts/**/*.test.ts",
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
