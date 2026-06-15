import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  RESY_LIVE_SMOKE_ERA158_CANONICAL_POLICY_ID,
  RESY_LIVE_SMOKE_ERA158_CAPABILITIES,
  RESY_LIVE_SMOKE_ERA158_INTEGRATION_HEALTH_PATH,
  RESY_LIVE_SMOKE_ERA158_POLICY_ID,
  RESY_LIVE_SMOKE_ERA158_SUMMARY_ARTIFACT,
  RESY_LIVE_SMOKE_ERA158_WIRING_PATHS,
} from "@/lib/integrations/resy-live-smoke-era158-policy";
import {
  auditResyLiveSmokeEra158Wiring,
  buildResyLiveSmokeEra158Summary,
  resolveResyLiveSmokeEra158ProofStatus,
} from "@/lib/integrations/resy-live-smoke-era158-smoke-summary";
import { RESY_LIVE_SMOKE_ERA90_POLICY_ID } from "@/lib/integrations/resy-live-smoke-era90-policy";

const ROOT = process.cwd();

describe("resy live smoke era158", () => {
  it("locks era158 policy and artifact path", () => {
    expect(RESY_LIVE_SMOKE_ERA158_POLICY_ID).toBe("era158-resy-live-v1");
    expect(RESY_LIVE_SMOKE_ERA158_SUMMARY_ARTIFACT).toBe(
      "artifacts/resy-live-smoke-era158-smoke-summary.json",
    );
    expect(RESY_LIVE_SMOKE_ERA158_INTEGRATION_HEALTH_PATH).toBe("/dashboard/integration-health");
    expect(RESY_LIVE_SMOKE_ERA158_WIRING_PATHS).toHaveLength(10);
    expect(RESY_LIVE_SMOKE_ERA158_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era158 with canonical Resy live smoke policy", () => {
    expect(RESY_LIVE_SMOKE_ERA158_CANONICAL_POLICY_ID).toBe(RESY_LIVE_SMOKE_ERA90_POLICY_ID);
  });

  it("audits in-repo Resy LIVE integration wiring", () => {
    const audit = auditResyLiveSmokeEra158Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of RESY_LIVE_SMOKE_ERA158_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth reservation sync and waitlist wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-resy-live.ts"), "utf8");
    expect(smoke).toContain("reservation_webhook_wiring");
    expect(smoke).toContain("waitlist_sync_wiring");
    expect(smoke).toContain("verifyResyWebhookSignature");
    expect(smoke).toContain("syncResyWaitlist");

    const reservationSync = readFileSync(
      join(ROOT, "services/integrations/resy/reservation-sync.service.ts"),
      "utf8",
    );
    expect(reservationSync).toContain("syncResyReservations");

    const webhook = readFileSync(
      join(ROOT, "services/integrations/resy/reservation-webhook.service.ts"),
      "utf8",
    );
    expect(webhook).toContain("processResyReservationWebhook");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveResyLiveSmokeEra158ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveResyLiveSmokeEra158ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildResyLiveSmokeEra158Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("reservation_sync");
    expect(summary.capabilities).toContain("waitlist");
  });
});
