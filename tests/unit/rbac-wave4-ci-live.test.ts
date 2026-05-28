import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const WAVE4_TESTS = [
  "tests/unit/delivery-route-actions-rbac.test.ts",
  "tests/unit/copilot-actions-rbac.test.ts",
  "tests/unit/demo-actions-rbac.test.ts",
  "tests/unit/demo-golden-scenario-rbac.test.ts",
  "tests/unit/feedback-actions-rbac.test.ts",
  "tests/unit/integration-menu-sync-rbac.test.ts",
  "tests/unit/production-calendar-actions-rbac.test.ts",
  "tests/unit/holiday-packages-rbac.test.ts",
] as const;

const WAVE4_MODULES = [
  "lib/routes/require-route-mutation.ts",
  "lib/ai/require-copilot-mutation.ts",
  "lib/demo/require-demo-mutation.ts",
  "lib/feedback/require-app-feedback-submit.ts",
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("RBAC wave 4 CI certification (live repo)", () => {
  it("defines test:ci:rbac-wave4 bundle with wave 4 RBAC tests", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:rbac-wave4"]).toBeTruthy();
    for (const rel of WAVE4_TESTS) {
      expect(scripts["test:ci:rbac-wave4"], `bundle missing ${rel}`).toContain(rel);
    }
  });

  it("includes wave 4 helper modules and action surfaces", () => {
    for (const rel of WAVE4_MODULES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "actions/delivery-route.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "actions/copilot.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "actions/demo-golden-scenario.ts"))).toBe(true);
  });
});
