import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { KITCHEN_SLA_TIMERS_CAPABILITIES } from "@/lib/kitchen/kitchen-sla-timers-p2-92-content";
import {
  KITCHEN_SLA_TIMERS_CAPABILITY_COUNT,
  KITCHEN_SLA_TIMERS_COMPONENT,
  KITCHEN_SLA_TIMERS_DOC,
  KITCHEN_SLA_TIMERS_HONESTY_MARKERS,
  KITCHEN_SLA_TIMERS_OPERATIONS_PATH,
  KITCHEN_SLA_TIMERS_PAGE,
  KITCHEN_SLA_TIMERS_POLICY_ID,
  KITCHEN_SLA_TIMERS_ROUTE,
  KITCHEN_SLA_TIMERS_SERVICE_PATH,
  KITCHEN_SLA_TIMERS_WIRING_PATHS,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-policy";

export type KitchenSlaTimersAuditSummary = {
  policyId: typeof KITCHEN_SLA_TIMERS_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyQueueClarityLinked: boolean;
  legacyProductionViewLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditKitchenSlaTimers(root = process.cwd()): KitchenSlaTimersAuditSummary {
  const wiringComplete = KITCHEN_SLA_TIMERS_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyQueueClarityLinked = false;
  let legacyProductionViewLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, KITCHEN_SLA_TIMERS_DOC))) {
    const source = readFileSync(join(root, KITCHEN_SLA_TIMERS_DOC), "utf8");
    docWired =
      source.includes(KITCHEN_SLA_TIMERS_ROUTE) &&
      source.includes(String(KITCHEN_SLA_TIMERS_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, KITCHEN_SLA_TIMERS_COMPONENT))) {
    const source = readFileSync(join(root, KITCHEN_SLA_TIMERS_COMPONENT), "utf8");
    componentWired =
      source.includes("KitchenSlaTimersPanel") &&
      source.includes("KITCHEN_SLA_TIMERS_CAPABILITIES");
    allTestIdsPresent =
      source.includes("KITCHEN_SLA_TIMERS_TEST_IDS[0]") &&
      source.includes("KITCHEN_SLA_TIMERS_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, KITCHEN_SLA_TIMERS_PAGE))) {
    const source = readFileSync(join(root, KITCHEN_SLA_TIMERS_PAGE), "utf8");
    pageWired =
      source.includes("KitchenSlaTimersPanel") &&
      source.includes("KITCHEN_SLA_TIMERS_POLICY_ID");
  }

  if (existsSync(join(root, KITCHEN_SLA_TIMERS_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, KITCHEN_SLA_TIMERS_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("resolveKitchenSlaTimerLevel") &&
      source.includes("detectKitchenSlaBottleneck") &&
      source.includes("computeAvgPrepTimeSeconds");
  }

  if (existsSync(join(root, KITCHEN_SLA_TIMERS_SERVICE_PATH))) {
    const source = readFileSync(join(root, KITCHEN_SLA_TIMERS_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadKitchenSlaTimersSnapshot") &&
      source.includes("KITCHEN_SLA_TIMERS_POLICY_ID");
  }

  const queueClarityPath = "lib/kitchen/kds-queue-clarity-era18.ts";
  if (existsSync(join(root, queueClarityPath))) {
    const source = readFileSync(join(root, queueClarityPath), "utf8");
    legacyQueueClarityLinked =
      source.includes("kdsTicketAgeClassName") || source.includes("KDS_OVERDUE_SECONDS");
  }

  const productionViewPath = "lib/kitchen/kds-production-view.ts";
  if (existsSync(join(root, productionViewPath))) {
    const source = readFileSync(join(root, productionViewPath), "utf8");
    legacyProductionViewLinked =
      source.includes("isBottleneck") || source.includes("bottleneckStation");
  }

  const combinedSources = [
    KITCHEN_SLA_TIMERS_DOC,
    KITCHEN_SLA_TIMERS_COMPONENT,
    "lib/kitchen/kitchen-sla-timers-p2-92-content.ts",
    KITCHEN_SLA_TIMERS_OPERATIONS_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = KITCHEN_SLA_TIMERS_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    KITCHEN_SLA_TIMERS_CAPABILITIES.length === KITCHEN_SLA_TIMERS_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyQueueClarityLinked &&
    legacyProductionViewLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: KITCHEN_SLA_TIMERS_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyQueueClarityLinked,
    legacyProductionViewLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatKitchenSlaTimersAuditLines(summary: KitchenSlaTimersAuditSummary): string[] {
  return [
    `Kitchen SLA timers audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${KITCHEN_SLA_TIMERS_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${KITCHEN_SLA_TIMERS_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Queue clarity linked: ${summary.legacyQueueClarityLinked ? "yes" : "no"}`,
    `Production view linked: ${summary.legacyProductionViewLinked ? "yes" : "no"}`,
    `Capabilities (${KITCHEN_SLA_TIMERS_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
