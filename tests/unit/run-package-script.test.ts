import { describe, expect, it } from "vitest";

import { rewritePackageScriptCommand } from "../../scripts/lib/run-package-script";

describe("run-package-script", () => {
  it("rewrites tsx to node tsx cli", () => {
    expect(rewritePackageScriptCommand("tsx scripts/foo.ts")).toBe(
      "node ./node_modules/tsx/dist/cli.mjs scripts/foo.ts",
    );
  });

  it("rewrites vitest to node vitest cli", () => {
    expect(rewritePackageScriptCommand("vitest run tests/foo.test.ts")).toContain(
      "node ./node_modules/vitest/vitest.mjs",
    );
  });

  it("does not rewrite vitest inside node_modules path", () => {
    expect(rewritePackageScriptCommand("node ./node_modules/vitest/vitest.mjs run tests/foo.test.ts")).toBe(
      "node ./node_modules/vitest/vitest.mjs run tests/foo.test.ts",
    );
  });
});
