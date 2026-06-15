import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  XERO_LIVE_SMOKE_ERA156_CANONICAL_POLICY_ID,
  XERO_LIVE_SMOKE_ERA156_CAPABILITIES,
  XERO_LIVE_SMOKE_ERA156_INTEGRATION_HEALTH_PATH,
  XERO_LIVE_SMOKE_ERA156_POLICY_ID,
  XERO_LIVE_SMOKE_ERA156_SUMMARY_ARTIFACT,
  XERO_LIVE_SMOKE_ERA156_WIRING_PATHS,
} from "@/lib/integrations/xero-live-smoke-era156-policy";
import {
  auditXeroLiveSmokeEra156Wiring,
  buildXeroLiveSmokeEra156Summary,
  resolveXeroLiveSmokeEra156ProofStatus,
} from "@/lib/integrations/xero-live-smoke-era156-smoke-summary";
import { XERO_LIVE_SMOKE_ERA81_POLICY_ID } from "@/lib/integrations/xero-live-smoke-era81-policy";

const ROOT = process.cwd();

describe("xero live smoke era156", () => {
  it("locks era156 policy and artifact path", () => {
    expect(XERO_LIVE_SMOKE_ERA156_POLICY_ID).toBe("era156-xero-live-v1");
    expect(XERO_LIVE_SMOKE_ERA156_SUMMARY_ARTIFACT).toBe(
      "artifacts/xero-live-smoke-era156-smoke-summary.json",
    );
    expect(XERO_LIVE_SMOKE_ERA156_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(XERO_LIVE_SMOKE_ERA156_WIRING_PATHS).toHaveLength(7);
    expect(XERO_LIVE_SMOKE_ERA156_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era156 with canonical Xero live smoke policy", () => {
    expect(XERO_LIVE_SMOKE_ERA156_CANONICAL_POLICY_ID).toBe(XERO_LIVE_SMOKE_ERA81_POLICY_ID);
  });

  it("audits in-repo Xero LIVE integration wiring", () => {
    const audit = auditXeroLiveSmokeEra156Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of XERO_LIVE_SMOKE_ERA156_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth invoice sync and bank reconciliation wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-xero-live.ts"), "utf8");
    expect(smoke).toContain("invoice_sync_wiring");
    expect(smoke).toContain("bank_reconciliation_wiring");
    expect(smoke).toContain("syncXeroSupplierInvoices");
    expect(smoke).toContain("reconcileXeroBankTransactions");

    const invoice = readFileSync(
      join(ROOT, "services/integrations/xero/invoice-sync.service.ts"),
      "utf8",
    );
    expect(invoice).toContain("syncXeroSupplierInvoices");

    const bank = readFileSync(
      join(ROOT, "services/integrations/xero/bank-reconciliation.service.ts"),
      "utf8",
    );
    expect(bank).toContain("reconcileXeroBankTransactions");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveXeroLiveSmokeEra156ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveXeroLiveSmokeEra156ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildXeroLiveSmokeEra156Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("invoice_sync");
    expect(summary.capabilities).toContain("bank_reconciliation");
  });
});
