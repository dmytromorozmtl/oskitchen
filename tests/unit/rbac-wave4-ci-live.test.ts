import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

const WAVE4_TESTS = [
  "tests/unit/delivery-route-actions-rbac.test.ts",
  "tests/unit/copilot-actions-rbac.test.ts",
  "tests/unit/demo-actions-rbac.test.ts",
  "tests/unit/demo-golden-scenario-rbac.test.ts",
  "tests/unit/feedback-actions-rbac.test.ts",
  "tests/unit/integration-menu-sync-rbac.test.ts",
  "tests/unit/production-calendar-actions-rbac.test.ts",
  "tests/unit/holiday-packages-rbac.test.ts",
  "tests/unit/restaurant-tables-actions-rbac.test.ts",
  "tests/unit/customer-subscription-rbac.test.ts",
  "tests/unit/experiment-ethics-review-rbac.test.ts",
] as const;

const WAVE4_MODULES = [
  "lib/routes/require-route-mutation.ts",
  "lib/ai/require-copilot-mutation.ts",
  "lib/demo/require-demo-mutation.ts",
  "lib/feedback/require-app-feedback-submit.ts",
  "lib/restaurant/require-restaurant-table-mutation.ts",
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
    expect(existsSync(join(ROOT, "actions/restaurant/tables.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "actions/customer-subscription.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "actions/experiment-ethics-review.ts"))).toBe(true);
  });

  it("chains test:ci:rbac-wave4 at end of test:security for security-db CI", () => {
    const scripts = readPackageScripts();
    const security = scripts["test:security"] ?? "";
    expect(security).toContain("npm run test:ci:rbac-wave4");
    expect(security.indexOf("test:ci:rbac-wave4")).toBeGreaterThan(
      security.indexOf("storefront-order-read-paths.integration.test.ts"),
    );
  });

  it("keeps security-db job running test:security in CI", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    expect(workflow).toContain("security-db:");
    expect(workflow).toContain("npm run test:security");
  });
});
