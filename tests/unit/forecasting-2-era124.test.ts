import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  FORECASTING_2_ERA124_CANONICAL_POLICY_ID,
  FORECASTING_2_ERA124_POLICY_ID,
  FORECASTING_2_ERA124_ROUTE,
  FORECASTING_2_ERA124_SERVICE,
  FORECASTING_2_ERA124_SIGNALS,
  FORECASTING_2_ERA124_SUMMARY_ARTIFACT,
  FORECASTING_2_ERA124_WIRING_PATHS,
} from "@/lib/ai/forecasting-era124-policy";
import {
  auditForecasting2SmokeWiring,
  buildForecasting2SmokeEra124Summary,
  resolveForecasting2SmokeEra124ProofStatus,
} from "@/lib/ai/forecasting-2-smoke-summary";
import { FORECASTING_2_POLICY_ID } from "@/lib/ai/forecasting-policy";

const ROOT = process.cwd();

describe("forecasting 2.0 era124", () => {
  it("locks era124 policy and artifact path", () => {
    expect(FORECASTING_2_ERA124_POLICY_ID).toBe("era124-forecasting-2-v1");
    expect(FORECASTING_2_ERA124_SUMMARY_ARTIFACT).toBe(
      "artifacts/forecasting-2-smoke-summary.json",
    );
    expect(FORECASTING_2_ERA124_ROUTE).toBe("/dashboard/forecast/forecasting-2");
    expect(FORECASTING_2_ERA124_SIGNALS).toHaveLength(3);
  });

  it("aligns era124 with canonical forecasting 2 policy", () => {
    expect(FORECASTING_2_ERA124_CANONICAL_POLICY_ID).toBe(FORECASTING_2_POLICY_ID);
  });

  it("audits in-repo Forecasting 2.0 wiring", () => {
    const audit = auditForecasting2SmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of FORECASTING_2_ERA124_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes 90-day weather holidays wiring", () => {
    const service = readFileSync(join(ROOT, FORECASTING_2_ERA124_SERVICE), "utf8");
    expect(service).toContain("loadForecasting2Snapshot");
    expect(service).toContain("FORECASTING_2_HISTORY_DAYS");

    const builders = readFileSync(join(ROOT, "lib/ai/forecasting-builders.ts"), "utf8");
    expect(builders).toContain("buildForecasting2Series");
    expect(builders).toContain("holidayMultiplierForDate");

    const panel = readFileSync(
      join(ROOT, "components/ai/forecasting-2-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("forecasting-2-panel");
    expect(panel).toContain("Weather + holiday adjusted");
    expect(panel).toContain("Upcoming holidays");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveForecasting2SmokeEra124ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveForecasting2SmokeEra124ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildForecasting2SmokeEra124Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.signals).toContain("holidays");
  });
});
