import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildIntegrationSandboxModeSnapshot } from "@/lib/integrations/integration-sandbox-mode-snapshot";
import {
  auditIntegrationSandboxP3_76,
  formatIntegrationSandboxP3_76AuditLines,
} from "@/lib/integrations/integration-sandbox-p3-76-audit";
import { validateIntegrationSandboxContract } from "@/lib/integrations/integration-sandbox-p3-76-measurement";
import {
  INTEGRATION_SANDBOX_P3_76_AUDIT_SCRIPT,
  INTEGRATION_SANDBOX_P3_76_CHECK_NPM_SCRIPT,
  INTEGRATION_SANDBOX_P3_76_DOC,
  INTEGRATION_SANDBOX_P3_76_LIVE_COUNT,
  INTEGRATION_SANDBOX_P3_76_NPM_SCRIPT,
  INTEGRATION_SANDBOX_P3_76_NPM_SCRIPTS,
  INTEGRATION_SANDBOX_P3_76_POLICY_ID,
  INTEGRATION_SANDBOX_P3_76_UNIT_TEST,
  INTEGRATION_SANDBOX_P3_76_UPSTREAM_POLICY_ID,
  INTEGRATION_SANDBOX_P3_76_UPSTREAM_TEST,
} from "@/lib/integrations/integration-sandbox-p3-76-policy";

const ROOT = process.cwd();

describe("Integration sandbox mode (P3-76)", () => {
  it("locks P3-76 policy and 18 LIVE surfaces", () => {
    expect(INTEGRATION_SANDBOX_P3_76_POLICY_ID).toBe("integration-sandbox-p3-76-v1");
    expect(INTEGRATION_SANDBOX_P3_76_UPSTREAM_POLICY_ID).toBe("integration-sandbox-p1-33-v1");
    expect(INTEGRATION_SANDBOX_P3_76_LIVE_COUNT).toBe(18);
  });

  it("builds redacted sandbox mode snapshot", () => {
    const snapshot = buildIntegrationSandboxModeSnapshot({
      E2E_STAGING_BASE_URL: "https://staging.test",
      WOOCOMMERCE_BASE_URL: "https://store.test",
    });
    expect(snapshot.rows).toHaveLength(18);
    expect(snapshot.integrationHealthReady).toBe(true);
    const woo = snapshot.rows.find((row) => row.integrationId === "woocommerce");
    expect(woo?.configured).toBe(true);
    expect(woo?.presentKeyCount).toBeGreaterThan(0);
  });

  it("validates upstream fleet + dashboard sandbox panel wiring", () => {
    const validation = validateIntegrationSandboxContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamFleetOk).toBe(true);
    expect(validation.modePanelWired).toBe(true);
    expect(validation.healthPageWired).toBe(true);
    expect(validation.snapshotRowsOk).toBe(true);
  });

  it("passes full integration sandbox P3-76 audit", () => {
    const summary = auditIntegrationSandboxP3_76(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.liveCount).toBe(18);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatIntegrationSandboxP3_76AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, INTEGRATION_SANDBOX_P3_76_DOC))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_SANDBOX_P3_76_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_SANDBOX_P3_76_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_SANDBOX_P3_76_UPSTREAM_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INTEGRATION_SANDBOX_P3_76_NPM_SCRIPT]).toContain(
      "audit-integration-sandbox-p3-76.ts",
    );
    expect(pkg.scripts?.[INTEGRATION_SANDBOX_P3_76_CHECK_NPM_SCRIPT]).toContain(
      INTEGRATION_SANDBOX_P3_76_UNIT_TEST,
    );
    for (const script of INTEGRATION_SANDBOX_P3_76_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
