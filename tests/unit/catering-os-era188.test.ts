import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CATERING_OS_ERA113_POLICY_ID } from "@/lib/catering/catering-os-era113-policy";
import {
  CATERING_OS_ERA188_CANONICAL_POLICY_ID,
  CATERING_OS_ERA188_MODULES,
  CATERING_OS_ERA188_POLICY_ID,
  CATERING_OS_ERA188_ROUTE,
  CATERING_OS_ERA188_SERVICE,
  CATERING_OS_ERA188_SUMMARY_ARTIFACT,
  CATERING_OS_ERA188_WIRING_PATHS,
} from "@/lib/catering/catering-os-era188-policy";
import {
  auditCateringOsSmokeEra188Wiring,
  buildCateringOsSmokeEra188Summary,
  resolveCateringOsSmokeEra188ProofStatus,
} from "@/lib/catering/catering-os-era188-smoke-summary";
import {
  CATERING_OS_POLICY_ID,
  CATERING_OS_SERVICE,
} from "@/lib/catering/catering-os-policy";

const ROOT = process.cwd();

describe("catering os era188", () => {
  it("locks era188 policy and artifact path", () => {
    expect(CATERING_OS_ERA188_POLICY_ID).toBe("era188-catering-os-v1");
    expect(CATERING_OS_ERA188_SUMMARY_ARTIFACT).toBe(
      "artifacts/catering-os-era188-smoke-summary.json",
    );
    expect(CATERING_OS_ERA188_ROUTE).toBe("/dashboard/catering");
    expect(CATERING_OS_ERA188_WIRING_PATHS).toHaveLength(5);
    expect(CATERING_OS_ERA188_MODULES).toHaveLength(4);
  });

  it("aligns era188 with canonical Catering OS policy", () => {
    expect(CATERING_OS_ERA188_CANONICAL_POLICY_ID).toBe(CATERING_OS_ERA113_POLICY_ID);
    expect(CATERING_OS_ERA188_SERVICE).toBe(CATERING_OS_SERVICE);
    expect(CATERING_OS_POLICY_ID).toBe("catering-os-v1");
  });

  it("audits in-repo Catering OS Round 2 wiring", () => {
    const audit = auditCateringOsSmokeEra188Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of CATERING_OS_ERA188_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes four-module events clients packing routes wiring", () => {
    const service = readFileSync(join(ROOT, CATERING_OS_ERA188_SERVICE), "utf8");
    expect(service).toContain("loadCateringOsDashboard");
    expect(service).toContain("loadPackingTasksForDate");
    expect(service).toContain("loadRouteOverviewKpis");
    expect(service).toContain("loadCateringQuoteKpis");

    const builders = readFileSync(join(ROOT, "lib/catering/catering-os-builders.ts"), "utf8");
    expect(builders).toContain("buildEventsModule");
    expect(builders).toContain("buildClientsModule");
    expect(builders).toContain("buildPackingModule");
    expect(builders).toContain("buildRoutesModule");

    const panel = readFileSync(
      join(ROOT, "components/catering/catering-os-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("catering-os-panel");
    expect(panel).toContain("Catering OS");
    expect(panel).toContain("modules.map");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCateringOsSmokeEra188ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCateringOsSmokeEra188ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCateringOsSmokeEra188Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.modules).toContain("events");
    expect(summary.modules).toContain("clients");
    expect(summary.modules).toContain("packing");
    expect(summary.modules).toContain("routes");
  });
});
