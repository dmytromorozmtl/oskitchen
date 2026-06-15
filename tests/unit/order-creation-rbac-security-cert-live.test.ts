import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("order creation RBAC security bundle certification (live repo)", () => {
  it("includes order-creation-rbac in test:security money-path bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:security"]).toContain("order-creation-rbac.test.ts");
    expect(scripts["test:security"]).toContain("order-creation-action-canonical.test.ts");
  });

  it("keeps security-db job running test:security in CI", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    expect(workflow).toContain("security-db:");
    expect(workflow).toContain("npm run test:security");
  });
});
