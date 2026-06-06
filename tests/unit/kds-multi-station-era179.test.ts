import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { KDS_MULTI_STATION_ERA104_CANONICAL_POLICY_ID, KDS_MULTI_STATION_ERA104_POLICY_ID } from "@/lib/kitchen/kds-multi-station-era104-policy";
import {
  KDS_MULTI_STATION_ERA179_CANONICAL_POLICY_ID,
  KDS_MULTI_STATION_ERA179_CAPABILITIES,
  KDS_MULTI_STATION_ERA179_FOOD_TYPES,
  KDS_MULTI_STATION_ERA179_MIN_STATIONS,
  KDS_MULTI_STATION_ERA179_POLICY_ID,
  KDS_MULTI_STATION_ERA179_SUMMARY_ARTIFACT,
  KDS_MULTI_STATION_ERA179_WIRING_PATHS,
} from "@/lib/kitchen/kds-multi-station-era179-policy";
import {
  auditKdsMultiStationSmokeEra179Wiring,
  buildKdsMultiStationSmokeEra179Summary,
  resolveKdsMultiStationSmokeEra179ProofStatus,
} from "@/lib/kitchen/kds-multi-station-era179-smoke-summary";
import {
  DEFAULT_KDS_STATIONS,
  KDS_MULTI_STATION_MIN_STATIONS,
  KDS_MULTI_STATION_POLICY_ID,
} from "@/lib/kitchen/kds-multi-station-policy";

const ROOT = process.cwd();

describe("kds multi-station era179", () => {
  it("locks era179 policy and artifact path", () => {
    expect(KDS_MULTI_STATION_ERA179_POLICY_ID).toBe("era179-kds-multi-station-v1");
    expect(KDS_MULTI_STATION_ERA179_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-multi-station-era179-smoke-summary.json",
    );
    expect(KDS_MULTI_STATION_ERA179_MIN_STATIONS).toBe(10);
    expect(KDS_MULTI_STATION_ERA179_FOOD_TYPES).toHaveLength(12);
    expect(KDS_MULTI_STATION_ERA179_WIRING_PATHS).toHaveLength(5);
    expect(KDS_MULTI_STATION_ERA179_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era179 with canonical KDS Multi-Station policy", () => {
    expect(KDS_MULTI_STATION_ERA179_CANONICAL_POLICY_ID).toBe(KDS_MULTI_STATION_ERA104_POLICY_ID);
    expect(KDS_MULTI_STATION_ERA104_CANONICAL_POLICY_ID).toBe(KDS_MULTI_STATION_POLICY_ID);
    expect(DEFAULT_KDS_STATIONS.length).toBeGreaterThanOrEqual(KDS_MULTI_STATION_MIN_STATIONS);
    expect(DEFAULT_KDS_STATIONS.length).toBe(12);
  });

  it("audits in-repo KDS Multi-Station Round 2 wiring", () => {
    const audit = auditKdsMultiStationSmokeEra179Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_MULTI_STATION_ERA179_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes station registry, routing, and production view wiring", () => {
    const service = readFileSync(
      join(ROOT, "services/kitchen/multi-station-service.ts"),
      "utf8",
    );
    expect(service).toContain("loadKdsStationRegistry");
    expect(service).toContain("loadKdsProductionViewWithRouting");

    const routing = readFileSync(join(ROOT, "lib/kitchen/kds-multi-station.ts"), "utf8");
    expect(routing).toContain("routeKdsWorkItemToStation");
    expect(routing).toContain("applyKdsMultiStationRouting");

    const production = readFileSync(
      join(ROOT, "components/kitchen/production-view-client.tsx"),
      "utf8",
    );
    expect(production).toContain("kds-multi-station-count");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsMultiStationSmokeEra179ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsMultiStationSmokeEra179ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsMultiStationSmokeEra179Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.foodTypes).toHaveLength(12);
    expect(summary.capabilities).toContain("station_registry");
    expect(summary.capabilities).toContain("food_type_routing");
  });
});
