import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  VAULT_READINESS_CANONICAL_DOC_PATHS,
  VAULT_READINESS_CI_SCRIPTS,
  VAULT_READINESS_HTML_ARTIFACT,
  VAULT_READINESS_OPS_SCRIPTS,
  VAULT_READINESS_ORCHESTRATOR_SCRIPT,
  VAULT_READINESS_POLICY_ID,
  VAULT_READINESS_PRODUCT_SURFACES,
  VAULT_READINESS_REPORT_ARTIFACT,
  VAULT_READINESS_UNIT_TESTS,
} from "@/lib/ops/vault-readiness-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("vault readiness cert (live repo)", () => {
  it("locks era29 vault readiness policy id", () => {
    expect(VAULT_READINESS_POLICY_ID).toBe("era29-vault-readiness-v1");
  });

  it("defines npm scripts and orchestrator", () => {
    const scripts = readPackageScripts();
    for (const name of [...VAULT_READINESS_OPS_SCRIPTS, ...VAULT_READINESS_CI_SCRIPTS]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(existsSync(join(ROOT, VAULT_READINESS_ORCHESTRATOR_SCRIPT))).toBe(true);
  });

  it("documents matrix and email template", () => {
    for (const rel of VAULT_READINESS_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    const matrix = readFileSync(join(ROOT, "docs/ops-vault-matrix.md"), "utf8");
    expect(matrix).toContain("E2E_STAGING_BASE_URL");
    expect(matrix).toContain("CHANNEL_SMOKE_OWNER_EMAIL");
  });

  it("wires product surfaces and unit tests", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/p0-ops-vault-phases-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("vaultReadinessCommand");
    const ui = readFileSync(join(ROOT, "lib/commercial/p0-ops-vault-ui-era21.ts"), "utf8");
    expect(ui).toContain("check-vault-readiness");
    expect(existsSync(join(ROOT, ".github/workflows/vault-readiness-check.yml"))).toBe(true);
    for (const rel of VAULT_READINESS_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("declares artifact paths", () => {
    expect(VAULT_READINESS_REPORT_ARTIFACT).toBe("artifacts/vault-readiness-report.json");
    expect(VAULT_READINESS_HTML_ARTIFACT).toBe("artifacts/vault-readiness-report.html");
  });
});
