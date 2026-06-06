import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CANONICAL_POLICY_ID,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CAPABILITIES,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_INTEGRATION_HEALTH_PATH,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_POLICY_ID,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SUMMARY_ARTIFACT,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_WIRING_PATHS,
} from "@/lib/integrations/seven-shifts-live-smoke-era159-policy";
import {
  auditSevenShiftsLiveSmokeEra159Wiring,
  buildSevenShiftsLiveSmokeEra159Summary,
  resolveSevenShiftsLiveSmokeEra159ProofStatus,
} from "@/lib/integrations/seven-shifts-live-smoke-era159-smoke-summary";
import { SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID } from "@/lib/integrations/seven-shifts-live-smoke-era82-policy";

const ROOT = process.cwd();

describe("seven-shifts live smoke era159", () => {
  it("locks era159 policy and artifact path", () => {
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA159_POLICY_ID).toBe("era159-seven-shifts-live-v1");
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SUMMARY_ARTIFACT).toBe(
      "artifacts/seven-shifts-live-smoke-era159-smoke-summary.json",
    );
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA159_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA159_WIRING_PATHS).toHaveLength(8);
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era159 with canonical 7shifts live smoke policy", () => {
    expect(SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CANONICAL_POLICY_ID).toBe(
      SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID,
    );
  });

  it("audits in-repo 7shifts LIVE integration wiring", () => {
    const audit = auditSevenShiftsLiveSmokeEra159Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SEVEN_SHIFTS_LIVE_SMOKE_ERA159_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth schedule import export and labor cost wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-seven-shifts-live.ts"), "utf8");
    expect(smoke).toContain("schedule_import_wiring");
    expect(smoke).toContain("labor_sync_wiring");
    expect(smoke).toContain("syncSevenShiftsScheduleImport");
    expect(smoke).toContain("syncSevenShiftsLaborCost");

    const scheduleImport = readFileSync(
      join(ROOT, "services/integrations/seven-shifts/schedule-import.service.ts"),
      "utf8",
    );
    expect(scheduleImport).toContain("syncSevenShiftsScheduleImport");

    const scheduleExport = readFileSync(
      join(ROOT, "services/integrations/seven-shifts/schedule-export.service.ts"),
      "utf8",
    );
    expect(scheduleExport).toContain("syncSevenShiftsScheduleExport");

    const labor = readFileSync(
      join(ROOT, "services/integrations/seven-shifts/labor-cost.service.ts"),
      "utf8",
    );
    expect(labor).toContain("syncSevenShiftsLaborCost");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveSevenShiftsLiveSmokeEra159ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveSevenShiftsLiveSmokeEra159ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildSevenShiftsLiveSmokeEra159Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("schedule_import_export");
    expect(summary.capabilities).toContain("labor_cost");
  });
});
