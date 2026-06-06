import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_INTEGRATION_HEALTH_PATH,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_WIRING_PATHS,
} from "@/lib/integrations/seven-shifts-live-smoke-era82-policy";
import {
  auditSevenShiftsLiveSmokeWiring,
  buildSevenShiftsLiveSmokeEra82Summary,
  isPlaceholderSevenShiftsCompanyId,
  resolveSevenShiftsLiveSmokeEra82ProofStatus,
} from "@/lib/integrations/seven-shifts-live-smoke-summary";

const ROOT = process.cwd();

describe("seven-shifts live smoke era82", () => {
  it("locks era82 policy and artifact path", () => {
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID).toBe("era82-seven-shifts-live-smoke-v1");
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT).toBe(
      "artifacts/seven-shifts-live-smoke-summary.json",
    );
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA82_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder 7shifts company IDs", () => {
    expect(isPlaceholderSevenShiftsCompanyId("smoke-test-company-id")).toBe(true);
    expect(isPlaceholderSevenShiftsCompanyId("12345678")).toBe(false);
  });

  it("audits in-repo 7shifts live smoke wiring", () => {
    const audit = auditSevenShiftsLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SEVEN_SHIFTS_LIVE_SMOKE_ERA82_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes schedule import and labor sync steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-seven-shifts-live.ts"), "utf8");
    expect(smoke).toContain("schedule_import_wiring");
    expect(smoke).toContain("labor_sync_wiring");
    expect(smoke).toContain("syncSevenShiftsScheduleImport");
    expect(smoke).toContain("syncSevenShiftsLaborCost");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveSevenShiftsLiveSmokeEra82ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveSevenShiftsLiveSmokeEra82ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_company",
      }),
    ).toBe("proof_skipped_placeholder_company");
  });

  it("builds SKIPPED summary when placeholder company blocks live OAuth", () => {
    const summary = buildSevenShiftsLiveSmokeEra82Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_company",
        missingEnvVars: [],
        steps: [
          {
            id: "seven_shifts_oauth_connection",
            label: "7shifts OAuth API connection",
            status: "SKIPPED",
            reason: "placeholder company",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_company");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
