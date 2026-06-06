import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  HOMEBASE_LIVE_SMOKE_ERA83_INTEGRATION_HEALTH_PATH,
  HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID,
  HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT,
  HOMEBASE_LIVE_SMOKE_ERA83_WIRING_PATHS,
} from "@/lib/integrations/homebase-live-smoke-era83-policy";
import {
  auditHomebaseLiveSmokeWiring,
  buildHomebaseLiveSmokeEra83Summary,
  isPlaceholderHomebaseLocationId,
  resolveHomebaseLiveSmokeEra83ProofStatus,
} from "@/lib/integrations/homebase-live-smoke-summary";

const ROOT = process.cwd();

describe("homebase live smoke era83", () => {
  it("locks era83 policy and artifact path", () => {
    expect(HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID).toBe("era83-homebase-live-smoke-v1");
    expect(HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT).toBe(
      "artifacts/homebase-live-smoke-summary.json",
    );
    expect(HOMEBASE_LIVE_SMOKE_ERA83_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Homebase location IDs", () => {
    expect(isPlaceholderHomebaseLocationId("smoke-test-location-id")).toBe(true);
    expect(isPlaceholderHomebaseLocationId("loc-12345678")).toBe(false);
  });

  it("audits in-repo Homebase live smoke wiring", () => {
    const audit = auditHomebaseLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of HOMEBASE_LIVE_SMOKE_ERA83_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes schedule import and time clock steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-homebase-live.ts"), "utf8");
    expect(smoke).toContain("schedule_import_wiring");
    expect(smoke).toContain("time_clock_wiring");
    expect(smoke).toContain("syncHomebaseScheduleImport");
    expect(smoke).toContain("syncHomebaseTimeClock");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveHomebaseLiveSmokeEra83ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveHomebaseLiveSmokeEra83ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_location",
      }),
    ).toBe("proof_skipped_placeholder_location");
  });

  it("builds SKIPPED summary when placeholder location blocks live OAuth", () => {
    const summary = buildHomebaseLiveSmokeEra83Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_location",
        missingEnvVars: [],
        steps: [
          {
            id: "homebase_oauth_connection",
            label: "Homebase OAuth API connection",
            status: "SKIPPED",
            reason: "placeholder location",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_location");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
