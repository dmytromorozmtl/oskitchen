import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { MULTI_STATION_KDS_STATIONS } from "@/lib/kitchen/multi-station-kds-p2-90-content";
import {
  assertMultiStationKdsCoreRegistry,
  MULTI_STATION_KDS_CORE_STATIONS,
} from "@/lib/kitchen/multi-station-kds-p2-90-core-stations";
import {
  MULTI_STATION_KDS_COMPONENT,
  MULTI_STATION_KDS_CORE_STATIONS_PATH,
  MULTI_STATION_KDS_DOC,
  MULTI_STATION_KDS_HONESTY_MARKERS,
  MULTI_STATION_KDS_PAGE,
  MULTI_STATION_KDS_POLICY_ID,
  MULTI_STATION_KDS_ROUTE,
  MULTI_STATION_KDS_SERVICE_PATH,
  MULTI_STATION_KDS_STATION_COUNT,
  MULTI_STATION_KDS_STATION_IDS,
  MULTI_STATION_KDS_WIRING_PATHS,
} from "@/lib/kitchen/multi-station-kds-p2-90-policy";

export type MultiStationKdsAuditSummary = {
  policyId: typeof MULTI_STATION_KDS_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  coreStationsWired: boolean;
  serviceWired: boolean;
  stationCountCorrect: boolean;
  allStationIdsPresent: boolean;
  allTestIdsPresent: boolean;
  legacyPolicyLinked: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditMultiStationKds(root = process.cwd()): MultiStationKdsAuditSummary {
  const wiringComplete = MULTI_STATION_KDS_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let coreStationsWired = false;
  let serviceWired = false;
  let allTestIdsPresent = false;
  let legacyPolicyLinked = false;

  if (existsSync(join(root, MULTI_STATION_KDS_DOC))) {
    const source = readFileSync(join(root, MULTI_STATION_KDS_DOC), "utf8");
    docWired =
      source.includes(MULTI_STATION_KDS_ROUTE) &&
      source.includes(String(MULTI_STATION_KDS_STATION_COUNT));
  }

  if (existsSync(join(root, MULTI_STATION_KDS_COMPONENT))) {
    const source = readFileSync(join(root, MULTI_STATION_KDS_COMPONENT), "utf8");
    componentWired =
      source.includes("MultiStationKdsPanel") &&
      source.includes("MULTI_STATION_KDS_STATIONS");
    allTestIdsPresent =
      source.includes("MULTI_STATION_KDS_TEST_IDS[0]") &&
      source.includes("MULTI_STATION_KDS_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, MULTI_STATION_KDS_PAGE))) {
    const source = readFileSync(join(root, MULTI_STATION_KDS_PAGE), "utf8");
    pageWired =
      source.includes("MultiStationKdsPanel") &&
      source.includes("MULTI_STATION_KDS_POLICY_ID");
  }

  if (existsSync(join(root, MULTI_STATION_KDS_CORE_STATIONS_PATH))) {
    const source = readFileSync(join(root, MULTI_STATION_KDS_CORE_STATIONS_PATH), "utf8");
    coreStationsWired =
      source.includes("MULTI_STATION_KDS_CORE_STATIONS") &&
      source.includes("filterRegistryToCoreStations") &&
      MULTI_STATION_KDS_STATION_IDS.every((id) => source.includes(`"${id}"`));
  }

  if (existsSync(join(root, MULTI_STATION_KDS_SERVICE_PATH))) {
    const source = readFileSync(join(root, MULTI_STATION_KDS_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadMultiStationKdsPilotSnapshot") &&
      source.includes("MULTI_STATION_KDS_POLICY_ID");
  }

  const legacyPath = "lib/kitchen/kds-multi-station-policy.ts";
  if (existsSync(join(root, legacyPath))) {
    const source = readFileSync(join(root, legacyPath), "utf8");
    legacyPolicyLinked =
      source.includes("multi-station-kds") || source.includes(MULTI_STATION_KDS_ROUTE);
  }

  const combinedSources = [
    MULTI_STATION_KDS_DOC,
    MULTI_STATION_KDS_COMPONENT,
    "lib/kitchen/multi-station-kds-p2-90-content.ts",
    MULTI_STATION_KDS_CORE_STATIONS_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MULTI_STATION_KDS_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const stationCountCorrect =
    MULTI_STATION_KDS_STATIONS.length === MULTI_STATION_KDS_STATION_COUNT &&
    assertMultiStationKdsCoreRegistry(MULTI_STATION_KDS_CORE_STATIONS);

  const allStationIdsPresent = MULTI_STATION_KDS_STATION_IDS.every((id) =>
    MULTI_STATION_KDS_CORE_STATIONS.some((station) => station.id === id),
  );

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    coreStationsWired &&
    serviceWired &&
    stationCountCorrect &&
    allStationIdsPresent &&
    allTestIdsPresent &&
    legacyPolicyLinked &&
    honestyMarkersPresent;

  return {
    policyId: MULTI_STATION_KDS_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    coreStationsWired,
    serviceWired,
    stationCountCorrect,
    allStationIdsPresent,
    allTestIdsPresent,
    legacyPolicyLinked,
    honestyMarkersPresent,
    passed,
  };
}

export function formatMultiStationKdsAuditLines(summary: MultiStationKdsAuditSummary): string[] {
  return [
    `Multi-station KDS audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MULTI_STATION_KDS_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${MULTI_STATION_KDS_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Core stations: ${summary.coreStationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Station count (${MULTI_STATION_KDS_STATION_COUNT}): ${summary.stationCountCorrect ? "yes" : "no"}`,
    `Station ids: ${summary.allStationIdsPresent ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Legacy policy linked: ${summary.legacyPolicyLinked ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
