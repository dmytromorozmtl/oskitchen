import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MONERIS_LIVE_SMOKE_ERA88_INTEGRATION_HEALTH_PATH,
  MONERIS_LIVE_SMOKE_ERA88_POLICY_ID,
  MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT,
  MONERIS_LIVE_SMOKE_ERA88_WIRING_PATHS,
} from "@/lib/integrations/moneris-live-smoke-era88-policy";
import {
  auditMonerisLiveSmokeWiring,
  buildMonerisLiveSmokeEra88Summary,
  isPlaceholderMonerisCredential,
  resolveMonerisLiveSmokeEra88ProofStatus,
} from "@/lib/integrations/moneris-live-smoke-summary";

const ROOT = process.cwd();

describe("moneris live smoke era88", () => {
  it("locks era88 policy and artifact path", () => {
    expect(MONERIS_LIVE_SMOKE_ERA88_POLICY_ID).toBe("era88-moneris-live-smoke-v1");
    expect(MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT).toBe(
      "artifacts/moneris-live-smoke-summary.json",
    );
    expect(MONERIS_LIVE_SMOKE_ERA88_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Moneris credentials", () => {
    expect(isPlaceholderMonerisCredential("smoke-test-moneris-token")).toBe(true);
    expect(isPlaceholderMonerisCredential("live_moneris_token_abc")).toBe(false);
  });

  it("audits in-repo Moneris live smoke wiring", () => {
    const audit = auditMonerisLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MONERIS_LIVE_SMOKE_ERA88_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes gateway and payment steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-moneris-live.ts"), "utf8");
    expect(smoke).toContain("gateway_connection_wiring");
    expect(smoke).toContain("payment_gateway_wiring");
    expect(smoke).toContain("verifyMonerisGatewayConnection");
    const gateway = readFileSync(
      join(ROOT, "services/integrations/moneris/payment-gateway.service.ts"),
      "utf8",
    );
    expect(gateway).toContain("processMonerisPayment");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveMonerisLiveSmokeEra88ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveMonerisLiveSmokeEra88ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_credentials",
      }),
    ).toBe("proof_skipped_placeholder_credentials");
  });

  it("builds SKIPPED summary when placeholder credentials block live gateway", () => {
    const summary = buildMonerisLiveSmokeEra88Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_credentials",
        missingEnvVars: [],
        steps: [
          {
            id: "gateway_connection_wiring",
            label: "Moneris gateway connection verify",
            status: "SKIPPED",
            reason: "placeholder credentials",
          },
        ],
      },
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_credentials");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
