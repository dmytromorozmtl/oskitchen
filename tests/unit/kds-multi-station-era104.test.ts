import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_MULTI_STATION_ERA104_CANONICAL_POLICY_ID,
  KDS_MULTI_STATION_ERA104_FOOD_TYPES,
  KDS_MULTI_STATION_ERA104_MIN_STATIONS,
  KDS_MULTI_STATION_ERA104_POLICY_ID,
  KDS_MULTI_STATION_ERA104_SUMMARY_ARTIFACT,
  KDS_MULTI_STATION_ERA104_WIRING_PATHS,
} from "@/lib/kitchen/kds-multi-station-era104-policy";
import {
  auditKdsMultiStationSmokeWiring,
  buildKdsMultiStationSmokeEra104Summary,
  resolveKdsMultiStationSmokeEra104ProofStatus,
} from "@/lib/kitchen/kds-multi-station-smoke-summary";
import {
  DEFAULT_KDS_STATIONS,
  KDS_MULTI_STATION_MIN_STATIONS,
  KDS_MULTI_STATION_POLICY_ID,
} from "@/lib/kitchen/kds-multi-station-policy";

const ROOT = process.cwd();

describe("kds multi-station era104", () => {
  it("locks era104 policy and artifact path", () => {
    expect(KDS_MULTI_STATION_ERA104_POLICY_ID).toBe("era104-kds-multi-station-v1");
    expect(KDS_MULTI_STATION_ERA104_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-multi-station-smoke-summary.json",
    );
    expect(KDS_MULTI_STATION_ERA104_MIN_STATIONS).toBe(10);
    expect(KDS_MULTI_STATION_ERA104_FOOD_TYPES).toHaveLength(12);
  });

  it("aligns era104 with canonical multi-station policy", () => {
    expect(KDS_MULTI_STATION_ERA104_CANONICAL_POLICY_ID).toBe(KDS_MULTI_STATION_POLICY_ID);
    expect(DEFAULT_KDS_STATIONS.length).toBeGreaterThanOrEqual(KDS_MULTI_STATION_MIN_STATIONS);
    expect(DEFAULT_KDS_STATIONS.length).toBe(12);
  });

  it("audits in-repo KDS Multi-Station wiring", () => {
    const audit = auditKdsMultiStationSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_MULTI_STATION_ERA104_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes station registry, routing, and production view wiring", () => {
    const service = readFileSync(
      join(ROOT, "services/kitchen/multi-station-service.ts"),
      "utf8",
    );
    expect(service).toContain("loadKdsStationRegistry");
    expect(service).toContain("buildKdsMultiStationSnapshot");

    const routing = readFileSync(join(ROOT, "lib/kitchen/kds-multi-station.ts"), "utf8");
    expect(routing).toContain("routeKdsWorkItemToStation");
    expect(routing).toContain("resolveKdsFoodTypeFromCategory");

    const production = readFileSync(
      join(ROOT, "components/kitchen/production-view-client.tsx"),
      "utf8",
    );
    expect(production).toContain("kds-multi-station-count");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsMultiStationSmokeEra104ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsMultiStationSmokeEra104ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsMultiStationSmokeEra104Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.foodTypes).toHaveLength(12);
  });
});
