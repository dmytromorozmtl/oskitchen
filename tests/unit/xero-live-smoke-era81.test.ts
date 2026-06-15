import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  XERO_LIVE_SMOKE_ERA81_INTEGRATION_HEALTH_PATH,
  XERO_LIVE_SMOKE_ERA81_POLICY_ID,
  XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT,
  XERO_LIVE_SMOKE_ERA81_WIRING_PATHS,
} from "@/lib/integrations/xero-live-smoke-era81-policy";
import {
  auditXeroLiveSmokeWiring,
  buildXeroLiveSmokeEra81Summary,
  isPlaceholderXeroTenantId,
  resolveXeroLiveSmokeEra81ProofStatus,
} from "@/lib/integrations/xero-live-smoke-summary";

const ROOT = process.cwd();

describe("xero live smoke era81", () => {
  it("locks era81 policy and artifact path", () => {
    expect(XERO_LIVE_SMOKE_ERA81_POLICY_ID).toBe("era81-xero-live-smoke-v1");
    expect(XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT).toBe(
      "artifacts/xero-live-smoke-summary.json",
    );
    expect(XERO_LIVE_SMOKE_ERA81_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Xero tenant IDs", () => {
    expect(isPlaceholderXeroTenantId("smoke-test-tenant-id")).toBe(true);
    expect(isPlaceholderXeroTenantId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(false);
  });

  it("audits in-repo Xero live smoke wiring", () => {
    const audit = auditXeroLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of XERO_LIVE_SMOKE_ERA81_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes invoice and bank reconcile steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-xero-live.ts"), "utf8");
    expect(smoke).toContain("invoice_sync_wiring");
    expect(smoke).toContain("bank_reconciliation_wiring");
    expect(smoke).toContain("syncXeroSupplierInvoices");
    expect(smoke).toContain("reconcileXeroBankTransactions");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveXeroLiveSmokeEra81ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveXeroLiveSmokeEra81ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_tenant",
      }),
    ).toBe("proof_skipped_placeholder_tenant");
  });

  it("builds SKIPPED summary when placeholder tenant blocks live OAuth", () => {
    const summary = buildXeroLiveSmokeEra81Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_tenant",
        missingEnvVars: [],
        steps: [
          {
            id: "xero_oauth_connection",
            label: "Xero OAuth API connection",
            status: "SKIPPED",
            reason: "placeholder tenant",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_tenant");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
