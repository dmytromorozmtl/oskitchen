import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  P0_OPS_VAULT_ERA21_CI_SCRIPTS,
  P0_OPS_VAULT_ERA21_DAY0_DOC,
  P0_OPS_VAULT_ERA21_OPS_SCRIPTS,
  P0_OPS_VAULT_ERA21_PLAYBOOK_DOC,
  P0_OPS_VAULT_ERA21_POLICY_ID,
  P0_OPS_VAULT_ERA21_PRODUCT_SURFACES,
  P0_OPS_VAULT_ERA21_UNIT_TESTS,
} from "@/lib/commercial/p0-ops-vault-era21-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("p0 ops vault era21 CI certification (live repo)", () => {
  it("locks era21 p0 ops vault policy id", () => {
    expect(P0_OPS_VAULT_ERA21_POLICY_ID).toBe("era21-p0-ops-vault-v1");
  });

  it("defines era21 p0 ops vault scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [...P0_OPS_VAULT_ERA21_OPS_SCRIPTS, ...P0_OPS_VAULT_ERA21_CI_SCRIPTS]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents playbook and day0 execution", () => {
    const playbook = readFileSync(join(ROOT, P0_OPS_VAULT_ERA21_PLAYBOOK_DOC), "utf8");
    const day0 = readFileSync(join(ROOT, P0_OPS_VAULT_ERA21_DAY0_DOC), "utf8");
    expect(playbook).toContain("ops:validate-p0-vault-env");
    expect(day0).toContain("integration-health");
    expect(day0).toContain("awaiting_ops_credentials");
    expect(day0).toContain("ops:sync-p0-vault-progress-report");
  });

  it("wires product surfaces and unit tests", () => {
    for (const rel of P0_OPS_VAULT_ERA21_PRODUCT_SURFACES) {
      const content = readFileSync(join(ROOT, rel), "utf8");
      expect(content.length).toBeGreaterThan(0);
    }
    expect(existsSync(join(ROOT, ".github/workflows/ops-p0-vault-validate.yml"))).toBe(true);
    for (const rel of P0_OPS_VAULT_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
