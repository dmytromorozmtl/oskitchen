import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  RESY_LIVE_SMOKE_ERA90_INTEGRATION_HEALTH_PATH,
  RESY_LIVE_SMOKE_ERA90_POLICY_ID,
  RESY_LIVE_SMOKE_ERA90_SUMMARY_ARTIFACT,
  RESY_LIVE_SMOKE_ERA90_WIRING_PATHS,
} from "@/lib/integrations/resy-live-smoke-era90-policy";
import {
  auditResyLiveSmokeWiring,
  buildResyLiveSmokeEra90Summary,
  isPlaceholderResyAccessToken,
  isPlaceholderResyVenueId,
  resolveResyLiveSmokeEra90ProofStatus,
} from "@/lib/integrations/resy-live-smoke-summary";

const ROOT = process.cwd();

describe("resy live smoke era90", () => {
  it("locks era90 policy and artifact path", () => {
    expect(RESY_LIVE_SMOKE_ERA90_POLICY_ID).toBe("era90-resy-live-smoke-v1");
    expect(RESY_LIVE_SMOKE_ERA90_SUMMARY_ARTIFACT).toBe(
      "artifacts/resy-live-smoke-summary.json",
    );
    expect(RESY_LIVE_SMOKE_ERA90_INTEGRATION_HEALTH_PATH).toBe("/dashboard/integration-health");
  });

  it("detects placeholder Resy credentials", () => {
    expect(isPlaceholderResyAccessToken("smoke-test-resy-token")).toBe(true);
    expect(isPlaceholderResyAccessToken("live_resy_token_abc")).toBe(false);
    expect(isPlaceholderResyVenueId("smoke-test-venue")).toBe(true);
    expect(isPlaceholderResyVenueId("venue12345")).toBe(false);
  });

  it("audits in-repo Resy live smoke wiring", () => {
    const audit = auditResyLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of RESY_LIVE_SMOKE_ERA90_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes reservation webhook and waitlist steps in smoke script", () => {
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
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveResyLiveSmokeEra90ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveResyLiveSmokeEra90ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_token",
      }),
    ).toBe("proof_skipped_placeholder_token");
  });

  it("builds SKIPPED summary when placeholder token blocks live OAuth", () => {
    const summary = buildResyLiveSmokeEra90Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_token",
        missingEnvVars: [],
        steps: [
          {
            id: "resy_oauth_connection",
            label: "Resy OAuth API connection",
            status: "SKIPPED",
            reason: "placeholder token",
          },
        ],
      },
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_token");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
