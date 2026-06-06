import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditForecasting2SmokeEra199Wiring,
  buildForecasting2SmokeEra199Summary,
  resolveForecasting2SmokeEra199ProofStatus,
} from "@/lib/ai/forecasting-2-era199-smoke-summary";
import {
  FORECASTING_2_ERA124_POLICY_ID,
} from "@/lib/ai/forecasting-era124-policy";
import {
  FORECASTING_2_ERA199_CANONICAL_POLICY_ID,
  FORECASTING_2_ERA199_POLICY_ID,
  FORECASTING_2_ERA199_ROUTE,
  FORECASTING_2_ERA199_SERVICE,
  FORECASTING_2_ERA199_SIGNALS,
  FORECASTING_2_ERA199_SUMMARY_ARTIFACT,
  FORECASTING_2_ERA199_WIRING_PATHS,
} from "@/lib/ai/forecasting-era199-policy";
import {
  FORECASTING_2_POLICY_ID,
  FORECASTING_2_SERVICE,
} from "@/lib/ai/forecasting-policy";

const ROOT = process.cwd();

describe("forecasting 2.0 era199", () => {
  it("locks era199 policy and artifact path", () => {
    expect(FORECASTING_2_ERA199_POLICY_ID).toBe("era199-forecasting-2-v1");
    expect(FORECASTING_2_ERA199_SUMMARY_ARTIFACT).toBe(
      "artifacts/forecasting-2-era199-smoke-summary.json",
    );
    expect(FORECASTING_2_ERA199_ROUTE).toBe("/dashboard/forecast/forecasting-2");
    expect(FORECASTING_2_ERA199_WIRING_PATHS).toHaveLength(5);
    expect(FORECASTING_2_ERA199_SIGNALS).toHaveLength(3);
  });

  it("aligns era199 with canonical Forecasting 2.0 policy", () => {
    expect(FORECASTING_2_ERA199_CANONICAL_POLICY_ID).toBe(FORECASTING_2_ERA124_POLICY_ID);
    expect(FORECASTING_2_ERA199_SERVICE).toBe(FORECASTING_2_SERVICE);
    expect(FORECASTING_2_POLICY_ID).toBe("forecasting-2-v1");
  });

  it("audits in-repo Forecasting 2.0 Round 2 wiring", () => {
    const audit = auditForecasting2SmokeEra199Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of FORECASTING_2_ERA199_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes 90-day weather holidays wiring", () => {
    const service = readFileSync(join(ROOT, FORECASTING_2_ERA199_SERVICE), "utf8");
    expect(service).toContain("loadForecasting2Snapshot");
    expect(service).toContain("buildForecasting2Snapshot");

    const builders = readFileSync(join(ROOT, "lib/ai/forecasting-builders.ts"), "utf8");
    expect(builders).toContain("weatherMultiplier");
    expect(builders).toContain("listUpcomingHolidayWindows");

    const panel = readFileSync(
      join(ROOT, "components/ai/forecasting-2-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("forecasting-2-panel");
    expect(panel).toContain("Next 30 days");
    expect(panel).toContain("Weather adjustments");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveForecasting2SmokeEra199ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveForecasting2SmokeEra199ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildForecasting2SmokeEra199Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.signals).toContain("90-day");
    expect(summary.signals).toContain("weather");
  });
});
