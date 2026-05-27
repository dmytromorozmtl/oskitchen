import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const KDS_SCOPE = join(ROOT, "docs/kds-v1-scope.md");
const KDS_ACTIONS = join(ROOT, "actions/kitchen-daily-kds.ts");
const CANONICAL_INDEX = join(ROOT, "docs/canonical-doc-index.md");

const REQUIRED_SCRIPTS = [
  "test:ci:kds-v1:unit",
  "test:ci:kds-v1:integration",
  "test:ci:kds-v1:cert",
] as const;

const REQUIRED_FILES = [
  "docs/kds-v1-scope.md",
  "lib/kitchen/kds-v1-gate.ts",
  "actions/kitchen-daily-kds.ts",
  "components/kitchen/kds-daily-service.tsx",
  "tests/unit/kitchen-daily-kds-rbac.test.ts",
  "tests/unit/kds-v1-gate.test.ts",
  "tests/contracts/kds-ticket.contract.test.ts",
  "tests/integration/kds-daily-queue-bump.integration.test.ts",
] as const;

const REQUIRED_SCOPE_SECTIONS = [
  "## In Scope (KDS v1)",
  "## Out of Scope (KDS v1)",
  "### 4. Permissions",
  "## Test Strategy",
  "## v1 Acceptance Criteria",
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("KDS v1 scope CI certification (live repo)", () => {
  it("defines KDS v1 unit, integration, and wiring cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-v1:unit"]).toContain("kitchen-daily-kds-rbac.test.ts");
    expect(scripts["test:ci:kds-v1:unit"]).toContain("kds-v1-gate.test.ts");
    expect(scripts["test:ci:kds-v1:unit"]).toContain("kds-ticket.contract.test.ts");
    expect(scripts["test:ci:kds-v1:integration"]).toContain(
      "kds-daily-queue-bump.integration.test.ts",
    );
  });

  it("includes KDS v1 cert and unit bundle in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:kds-v1:cert");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:kds-v1:unit");
  });

  it("locks canonical KDS v1 scope doc with workflow, permissions, and boundaries", () => {
    expect(existsSync(KDS_SCOPE)).toBe(true);
    const scope = readFileSync(KDS_SCOPE, "utf8");
    for (const section of REQUIRED_SCOPE_SECTIONS) {
      expect(scope, `missing section ${section}`).toContain(section);
    }
    expect(scope).toContain("kitchen.view");
    expect(scope).toContain("kitchen.bump");
    expect(scope).toContain("kitchen.recall");
    expect(scope).toContain("DAILY_SERVICE");
    expect(scope).toMatch(/not.*Toast|Explicitly not v1/i);
  });

  it("references KDS v1 scope in canonical doc index", () => {
    expect(existsSync(CANONICAL_INDEX)).toBe(true);
    const index = readFileSync(CANONICAL_INDEX, "utf8");
    expect(index).toContain("kds-v1-scope.md");
    expect(index).toMatch(/17–18|KDS v1 scope/i);
  });

  it("enforces permissioned daily KDS mutations in actions", () => {
    const source = readFileSync(KDS_ACTIONS, "utf8");
    expect(source).toContain("requireMutationPermission");
    expect(source).toContain("kitchen.bump");
    expect(source).toContain("kitchen.recall");
    expect(source).toContain("logKitchenPermissionDenied");
  });

  it("requires KDS v1 scope and test artifacts on disk", () => {
    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
