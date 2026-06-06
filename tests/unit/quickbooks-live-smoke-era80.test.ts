import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  QUICKBOOKS_LIVE_SMOKE_ERA80_INTEGRATION_HEALTH_PATH,
  QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID,
  QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT,
  QUICKBOOKS_LIVE_SMOKE_ERA80_WIRING_PATHS,
} from "@/lib/integrations/quickbooks-live-smoke-era80-policy";
import {
  auditQuickBooksLiveSmokeWiring,
  buildQuickBooksLiveSmokeEra80Summary,
  isPlaceholderQuickBooksRealmId,
  resolveQuickBooksLiveSmokeEra80ProofStatus,
} from "@/lib/integrations/quickbooks-live-smoke-summary";

const ROOT = process.cwd();

describe("quickbooks live smoke era80", () => {
  it("locks era80 policy and artifact path", () => {
    expect(QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID).toBe("era80-quickbooks-live-smoke-v1");
    expect(QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT).toBe(
      "artifacts/quickbooks-live-smoke-summary.json",
    );
    expect(QUICKBOOKS_LIVE_SMOKE_ERA80_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder QuickBooks realm IDs", () => {
    expect(isPlaceholderQuickBooksRealmId("smoke-test-realm-id")).toBe(true);
    expect(isPlaceholderQuickBooksRealmId("1234567890")).toBe(false);
  });

  it("audits in-repo QuickBooks live smoke wiring", () => {
    const audit = auditQuickBooksLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of QUICKBOOKS_LIVE_SMOKE_ERA80_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes chart and journal steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-quickbooks-live.ts"), "utf8");
    expect(smoke).toContain("chart_of_accounts_sync");
    expect(smoke).toContain("daily_journal_wiring");
    expect(smoke).toContain("postQuickBooksDailySalesJournal");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveQuickBooksLiveSmokeEra80ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveQuickBooksLiveSmokeEra80ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_realm",
      }),
    ).toBe("proof_skipped_placeholder_realm");
  });

  it("builds SKIPPED summary when placeholder realm blocks live OAuth", () => {
    const summary = buildQuickBooksLiveSmokeEra80Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_realm",
        missingEnvVars: [],
        steps: [
          {
            id: "quickbooks_oauth_connection",
            label: "QuickBooks OAuth API connection",
            status: "SKIPPED",
            reason: "placeholder realm",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_realm");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
