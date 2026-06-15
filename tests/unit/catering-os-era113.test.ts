import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CATERING_OS_ERA113_CANONICAL_POLICY_ID,
  CATERING_OS_ERA113_MODULES,
  CATERING_OS_ERA113_POLICY_ID,
  CATERING_OS_ERA113_ROUTE,
  CATERING_OS_ERA113_SERVICE,
  CATERING_OS_ERA113_SUMMARY_ARTIFACT,
  CATERING_OS_ERA113_WIRING_PATHS,
} from "@/lib/catering/catering-os-era113-policy";
import {
  auditCateringOsSmokeWiring,
  buildCateringOsSmokeEra113Summary,
  resolveCateringOsSmokeEra113ProofStatus,
} from "@/lib/catering/catering-os-smoke-summary";
import {
  CATERING_OS_POLICY_ID,
  CATERING_OS_SERVICE,
} from "@/lib/catering/catering-os-policy";

const ROOT = process.cwd();

describe("catering os era113", () => {
  it("locks era113 policy and artifact path", () => {
    expect(CATERING_OS_ERA113_POLICY_ID).toBe("era113-catering-os-v1");
    expect(CATERING_OS_ERA113_SUMMARY_ARTIFACT).toBe(
      "artifacts/catering-os-smoke-summary.json",
    );
    expect(CATERING_OS_ERA113_ROUTE).toBe("/dashboard/catering");
    expect(CATERING_OS_ERA113_MODULES).toHaveLength(4);
  });

  it("aligns era113 with canonical catering policy", () => {
    expect(CATERING_OS_ERA113_CANONICAL_POLICY_ID).toBe(CATERING_OS_POLICY_ID);
    expect(CATERING_OS_ERA113_SERVICE).toBe(CATERING_OS_SERVICE);
  });

  it("audits in-repo Catering OS wiring", () => {
    const audit = auditCateringOsSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of CATERING_OS_ERA113_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes four-module events clients packing routes wiring", () => {
    const service = readFileSync(join(ROOT, CATERING_OS_ERA113_SERVICE), "utf8");
    expect(service).toContain("loadCateringOsDashboard");
    expect(service).toContain("loadPackingTasksForDate");
    expect(service).toContain("loadRouteOverviewKpis");

    const builders = readFileSync(join(ROOT, "lib/catering/catering-os-builders.ts"), "utf8");
    expect(builders).toContain("buildEventsModule");
    expect(builders).toContain("buildRoutesModule");

    const panel = readFileSync(
      join(ROOT, "components/catering/catering-os-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("catering-os-panel");
    expect(panel).toContain("Catering OS");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCateringOsSmokeEra113ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCateringOsSmokeEra113ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCateringOsSmokeEra113Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.modules).toContain("packing");
  });
});
