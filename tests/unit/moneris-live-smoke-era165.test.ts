import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { MONERIS_LIVE_SMOKE_ERA88_POLICY_ID } from "@/lib/integrations/moneris-live-smoke-era88-policy";
import {
  MONERIS_LIVE_SMOKE_ERA165_CANONICAL_POLICY_ID,
  MONERIS_LIVE_SMOKE_ERA165_CAPABILITIES,
  MONERIS_LIVE_SMOKE_ERA165_INTEGRATION_HEALTH_PATH,
  MONERIS_LIVE_SMOKE_ERA165_POLICY_ID,
  MONERIS_LIVE_SMOKE_ERA165_SUMMARY_ARTIFACT,
  MONERIS_LIVE_SMOKE_ERA165_WIRING_PATHS,
} from "@/lib/integrations/moneris-live-smoke-era165-policy";
import {
  auditMonerisLiveSmokeEra165Wiring,
  buildMonerisLiveSmokeEra165Summary,
  resolveMonerisLiveSmokeEra165ProofStatus,
} from "@/lib/integrations/moneris-live-smoke-era165-smoke-summary";

const ROOT = process.cwd();

describe("moneris live smoke era165", () => {
  it("locks era165 policy and artifact path", () => {
    expect(MONERIS_LIVE_SMOKE_ERA165_POLICY_ID).toBe("era165-moneris-live-v1");
    expect(MONERIS_LIVE_SMOKE_ERA165_SUMMARY_ARTIFACT).toBe(
      "artifacts/moneris-live-smoke-era165-smoke-summary.json",
    );
    expect(MONERIS_LIVE_SMOKE_ERA165_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(MONERIS_LIVE_SMOKE_ERA165_WIRING_PATHS).toHaveLength(6);
    expect(MONERIS_LIVE_SMOKE_ERA165_CAPABILITIES).toHaveLength(2);
  });

  it("aligns era165 with canonical Moneris live smoke policy", () => {
    expect(MONERIS_LIVE_SMOKE_ERA165_CANONICAL_POLICY_ID).toBe(MONERIS_LIVE_SMOKE_ERA88_POLICY_ID);
  });

  it("audits in-repo Moneris LIVE integration wiring", () => {
    const audit = auditMonerisLiveSmokeEra165Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MONERIS_LIVE_SMOKE_ERA165_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth and payment gateway wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-moneris-live.ts"), "utf8");
    expect(smoke).toContain("gateway_connection_wiring");
    expect(smoke).toContain("payment_gateway_wiring");
    expect(smoke).toContain("verifyMonerisGatewayConnection");

    const gateway = readFileSync(
      join(ROOT, "services/integrations/moneris/payment-gateway.service.ts"),
      "utf8",
    );
    expect(gateway).toContain("processMonerisPayment");

    const oauth = readFileSync(
      join(ROOT, "app/api/integrations/moneris/oauth/callback/route.ts"),
      "utf8",
    );
    expect(oauth.length).toBeGreaterThan(0);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMonerisLiveSmokeEra165ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMonerisLiveSmokeEra165ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMonerisLiveSmokeEra165Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("oauth");
    expect(summary.capabilities).toContain("payment_gateway");
  });
});
