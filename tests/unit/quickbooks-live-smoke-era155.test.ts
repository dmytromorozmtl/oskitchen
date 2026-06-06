import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  QUICKBOOKS_LIVE_SMOKE_ERA155_CANONICAL_POLICY_ID,
  QUICKBOOKS_LIVE_SMOKE_ERA155_CAPABILITIES,
  QUICKBOOKS_LIVE_SMOKE_ERA155_INTEGRATION_HEALTH_PATH,
  QUICKBOOKS_LIVE_SMOKE_ERA155_POLICY_ID,
  QUICKBOOKS_LIVE_SMOKE_ERA155_SUMMARY_ARTIFACT,
  QUICKBOOKS_LIVE_SMOKE_ERA155_WIRING_PATHS,
} from "@/lib/integrations/quickbooks-live-smoke-era155-policy";
import {
  auditQuickBooksLiveSmokeEra155Wiring,
  buildQuickBooksLiveSmokeEra155Summary,
  resolveQuickBooksLiveSmokeEra155ProofStatus,
} from "@/lib/integrations/quickbooks-live-smoke-era155-smoke-summary";
import { QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID } from "@/lib/integrations/quickbooks-live-smoke-era80-policy";

const ROOT = process.cwd();

describe("quickbooks live smoke era155", () => {
  it("locks era155 policy and artifact path", () => {
    expect(QUICKBOOKS_LIVE_SMOKE_ERA155_POLICY_ID).toBe("era155-quickbooks-live-v1");
    expect(QUICKBOOKS_LIVE_SMOKE_ERA155_SUMMARY_ARTIFACT).toBe(
      "artifacts/quickbooks-live-smoke-era155-smoke-summary.json",
    );
    expect(QUICKBOOKS_LIVE_SMOKE_ERA155_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(QUICKBOOKS_LIVE_SMOKE_ERA155_WIRING_PATHS).toHaveLength(7);
    expect(QUICKBOOKS_LIVE_SMOKE_ERA155_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era155 with canonical QuickBooks live smoke policy", () => {
    expect(QUICKBOOKS_LIVE_SMOKE_ERA155_CANONICAL_POLICY_ID).toBe(
      QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID,
    );
  });

  it("audits in-repo QuickBooks LIVE integration wiring", () => {
    const audit = auditQuickBooksLiveSmokeEra155Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of QUICKBOOKS_LIVE_SMOKE_ERA155_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth chart of accounts and daily journal wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-quickbooks-live.ts"), "utf8");
    expect(smoke).toContain("chart_of_accounts_sync");
    expect(smoke).toContain("daily_journal_wiring");
    expect(smoke).toContain("postQuickBooksDailySalesJournal");

    const journal = readFileSync(
      join(ROOT, "services/integrations/quickbooks/daily-sales-journal.service.ts"),
      "utf8",
    );
    expect(journal).toContain("postQuickBooksDailySalesJournal");

    const chart = readFileSync(
      join(ROOT, "services/integrations/quickbooks/chart-of-accounts.service.ts"),
      "utf8",
    );
    expect(chart).toContain("fetchQuickBooksChartOfAccounts");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveQuickBooksLiveSmokeEra155ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveQuickBooksLiveSmokeEra155ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildQuickBooksLiveSmokeEra155Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("daily_sales_journal");
    expect(summary.capabilities).toContain("chart_of_accounts");
  });
});
