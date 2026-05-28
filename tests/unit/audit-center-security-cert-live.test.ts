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

describe("audit center RBAC security bundle certification (live repo)", () => {
  it("includes audit-center-actions-rbac in test:security and rbac-wave3", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:security"]).toContain("audit-center-actions-rbac.test.ts");
    expect(scripts["test:ci:rbac-wave3"]).toContain("audit-center-actions-rbac.test.ts");
  });

  it("keeps security-db job running test:security in CI", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    expect(workflow).toContain("security-db:");
    expect(workflow).toContain("npm run test:security");
  });
});
