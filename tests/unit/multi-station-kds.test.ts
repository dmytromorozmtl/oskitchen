import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  applyKdsMultiStationRouting,
  buildKdsMultiStationSnapshot,
} from "@/lib/kitchen/kds-multi-station";
import { auditMultiStationKds, formatMultiStationKdsAuditLines } from "@/lib/kitchen/multi-station-kds-p2-90-audit";
import {
  assertMultiStationKdsCoreRegistry,
  filterRegistryToCoreStations,
  MULTI_STATION_KDS_CORE_STATIONS,
} from "@/lib/kitchen/multi-station-kds-p2-90-core-stations";
import { MULTI_STATION_KDS_STATIONS } from "@/lib/kitchen/multi-station-kds-p2-90-content";
import {
  MULTI_STATION_KDS_CI_WORKFLOW,
  MULTI_STATION_KDS_DOC,
  MULTI_STATION_KDS_NPM_SCRIPT,
  MULTI_STATION_KDS_POLICY_ID,
  MULTI_STATION_KDS_ROUTE,
  MULTI_STATION_KDS_STATION_COUNT,
  MULTI_STATION_KDS_STATION_IDS,
  MULTI_STATION_KDS_UNIT_TEST,
} from "@/lib/kitchen/multi-station-kds-p2-90-policy";

const ROOT = process.cwd();

describe("Multi-station KDS (P2-90)", () => {
  it("locks policy id, route, and six core stations", () => {
    expect(MULTI_STATION_KDS_POLICY_ID).toBe("multi-station-kds-p2-90-v1");
    expect(MULTI_STATION_KDS_ROUTE).toBe("/dashboard/kitchen/multi-station");
    expect(MULTI_STATION_KDS_STATION_COUNT).toBe(6);
    expect(MULTI_STATION_KDS_STATION_IDS).toEqual([
      "grill",
      "fry",
      "cold",
      "bar",
      "expo",
      "packing",
    ]);
    expect(MULTI_STATION_KDS_STATIONS).toHaveLength(6);
    expect(assertMultiStationKdsCoreRegistry(MULTI_STATION_KDS_CORE_STATIONS)).toBe(true);
  });

  it("passes full multi-station KDS audit", () => {
    const summary = auditMultiStationKds(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.coreStationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.stationCountCorrect).toBe(true);
    expect(summary.allStationIdsPresent).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.legacyPolicyLinked).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("routes items to core stations including packing", () => {
    const registry = filterRegistryToCoreStations(MULTI_STATION_KDS_CORE_STATIONS);
    const routed = applyKdsMultiStationRouting(
      [
        {
          id: "1",
          title: "Cheeseburger",
          station: null,
          status: "TO_PREP",
          priority: "NORMAL",
          quantity: 1,
          dueAtIso: null,
          createdAtIso: "2026-06-09T12:00:00.000Z",
          startedAtIso: null,
          productCategory: "MAINS",
        },
        {
          id: "2",
          title: "Delivery bag seal",
          station: null,
          status: "TO_PREP",
          priority: "NORMAL",
          quantity: 1,
          dueAtIso: null,
          createdAtIso: "2026-06-09T12:00:00.000Z",
          startedAtIso: null,
          productCategory: "OTHER",
        },
      ],
      registry,
    );
    expect(routed[0]?.routedStation).toBe("Grill");
    expect(routed[1]?.routedStation).toBe("Packing");
  });

  it("builds snapshot with six core registry stations", () => {
    const registry = filterRegistryToCoreStations(MULTI_STATION_KDS_CORE_STATIONS);
    const snapshot = buildKdsMultiStationSnapshot([], registry);
    expect(snapshot.stationCount).toBe(6);
    expect(snapshot.production.stations).toHaveLength(6);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, MULTI_STATION_KDS_DOC))).toBe(true);
    expect(existsSync(join(ROOT, MULTI_STATION_KDS_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MULTI_STATION_KDS_NPM_SCRIPT]).toContain("audit-multi-station-kds.ts");
    expect(pkg.scripts?.["test:ci:multi-station-kds"]).toContain(MULTI_STATION_KDS_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, MULTI_STATION_KDS_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:multi-station-kds");
  });

  it("formats audit lines", () => {
    const lines = formatMultiStationKdsAuditLines(auditMultiStationKds(ROOT));
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
