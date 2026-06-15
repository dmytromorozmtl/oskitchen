import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OPENTABLE_LIVE_SMOKE_ERA157_CANONICAL_POLICY_ID,
  OPENTABLE_LIVE_SMOKE_ERA157_CAPABILITIES,
  OPENTABLE_LIVE_SMOKE_ERA157_INTEGRATION_HEALTH_PATH,
  OPENTABLE_LIVE_SMOKE_ERA157_POLICY_ID,
  OPENTABLE_LIVE_SMOKE_ERA157_SUMMARY_ARTIFACT,
  OPENTABLE_LIVE_SMOKE_ERA157_WIRING_PATHS,
} from "@/lib/integrations/opentable-live-smoke-era157-policy";
import {
  auditOpenTableLiveSmokeEra157Wiring,
  buildOpenTableLiveSmokeEra157Summary,
  resolveOpenTableLiveSmokeEra157ProofStatus,
} from "@/lib/integrations/opentable-live-smoke-era157-smoke-summary";
import { OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID } from "@/lib/integrations/opentable-live-smoke-era89-policy";

const ROOT = process.cwd();

describe("opentable live smoke era157", () => {
  it("locks era157 policy and artifact path", () => {
    expect(OPENTABLE_LIVE_SMOKE_ERA157_POLICY_ID).toBe("era157-opentable-live-v1");
    expect(OPENTABLE_LIVE_SMOKE_ERA157_SUMMARY_ARTIFACT).toBe(
      "artifacts/opentable-live-smoke-era157-smoke-summary.json",
    );
    expect(OPENTABLE_LIVE_SMOKE_ERA157_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(OPENTABLE_LIVE_SMOKE_ERA157_WIRING_PATHS).toHaveLength(8);
    expect(OPENTABLE_LIVE_SMOKE_ERA157_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era157 with canonical OpenTable live smoke policy", () => {
    expect(OPENTABLE_LIVE_SMOKE_ERA157_CANONICAL_POLICY_ID).toBe(
      OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID,
    );
  });

  it("audits in-repo OpenTable LIVE integration wiring", () => {
    const audit = auditOpenTableLiveSmokeEra157Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of OPENTABLE_LIVE_SMOKE_ERA157_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth reservation webhook and table availability wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-opentable-live.ts"), "utf8");
    expect(smoke).toContain("reservation_webhook_wiring");
    expect(smoke).toContain("table_availability_wiring");
    expect(smoke).toContain("verifyOpenTableWebhookSignature");
    expect(smoke).toContain("syncOpenTableAvailability");

    const webhook = readFileSync(
      join(ROOT, "services/integrations/opentable/reservation-webhook.service.ts"),
      "utf8",
    );
    expect(webhook).toContain("processOpenTableReservationWebhook");

    const availability = readFileSync(
      join(ROOT, "services/integrations/opentable/table-availability.service.ts"),
      "utf8",
    );
    expect(availability).toContain("syncOpenTableAvailability");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveOpenTableLiveSmokeEra157ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveOpenTableLiveSmokeEra157ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildOpenTableLiveSmokeEra157Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("reservation_webhook");
    expect(summary.capabilities).toContain("table_availability");
  });
});
