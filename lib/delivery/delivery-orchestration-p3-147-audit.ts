import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkDeliveryOrchestrationLegacyDispatchWiring,
  checkDeliveryOrchestrationLiveWiring,
  checkDeliveryOrchestrationRouteOptimizationAudit,
  loadDeliveryOrchestrationOloRegistry,
  validateDeliveryOrchestrationOloRegistry,
} from "@/lib/delivery/delivery-orchestration-p3-147-operations";
import {
  DELIVERY_ORCHESTRATION_P3_147_ARTIFACT,
  DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT,
  DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS,
  DELIVERY_ORCHESTRATION_P3_147_COMPETITOR,
  DELIVERY_ORCHESTRATION_P3_147_DOC,
  DELIVERY_ORCHESTRATION_P3_147_HEADLINE,
  DELIVERY_ORCHESTRATION_P3_147_HONESTY_MARKERS,
  DELIVERY_ORCHESTRATION_P3_147_IMPLEMENTATION_REF,
  DELIVERY_ORCHESTRATION_P3_147_POLICY_ID,
  DELIVERY_ORCHESTRATION_P3_147_POSITIONING_LINE,
  DELIVERY_ORCHESTRATION_P3_147_RELATED_DOCS,
  DELIVERY_ORCHESTRATION_P3_147_ROUTE,
  DELIVERY_ORCHESTRATION_P3_147_WIRING_PATHS,
} from "@/lib/delivery/delivery-orchestration-p3-147-policy";

export type DeliveryOrchestrationP3_147AuditSummary = {
  policyId: typeof DELIVERY_ORCHESTRATION_P3_147_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  routeOptimizationAuditPassed: boolean;
  legacyDispatchWiringPassed: boolean;
  liveOrchestrationWiringPassed: boolean;
  relatedDocsReferenced: boolean;
  capabilitiesDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditDeliveryOrchestrationP3_147(
  root = process.cwd(),
): DeliveryOrchestrationP3_147AuditSummary {
  const wiringComplete = DELIVERY_ORCHESTRATION_P3_147_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let capabilitiesDocumented = false;

  if (existsSync(join(root, DELIVERY_ORCHESTRATION_P3_147_DOC))) {
    const source = readFileSync(join(root, DELIVERY_ORCHESTRATION_P3_147_DOC), "utf8");
    docWired =
      source.includes(DELIVERY_ORCHESTRATION_P3_147_HEADLINE) &&
      source.includes(DELIVERY_ORCHESTRATION_P3_147_POSITIONING_LINE) &&
      source.includes(DELIVERY_ORCHESTRATION_P3_147_COMPETITOR) &&
      source.includes(DELIVERY_ORCHESTRATION_P3_147_IMPLEMENTATION_REF) &&
      source.includes(String(DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT)) &&
      source.includes(DELIVERY_ORCHESTRATION_P3_147_ROUTE);
    relatedDocsReferenced = DELIVERY_ORCHESTRATION_P3_147_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    capabilitiesDocumented = DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS.every((capabilityId) =>
      source.includes(capabilityId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, DELIVERY_ORCHESTRATION_P3_147_ARTIFACT))) {
    const registry = loadDeliveryOrchestrationOloRegistry(root);
    registryValid = validateDeliveryOrchestrationOloRegistry(registry).valid;
  }

  const routeOptimizationAuditPassed = checkDeliveryOrchestrationRouteOptimizationAudit(root);
  const legacyDispatchWiringPassed = checkDeliveryOrchestrationLegacyDispatchWiring(root);
  const liveOrchestrationWiringPassed = checkDeliveryOrchestrationLiveWiring(root);

  const combinedSources = [DELIVERY_ORCHESTRATION_P3_147_DOC, DELIVERY_ORCHESTRATION_P3_147_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = DELIVERY_ORCHESTRATION_P3_147_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    routeOptimizationAuditPassed &&
    legacyDispatchWiringPassed &&
    liveOrchestrationWiringPassed &&
    relatedDocsReferenced &&
    capabilitiesDocumented &&
    honestyMarkersPresent;

  return {
    policyId: DELIVERY_ORCHESTRATION_P3_147_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    routeOptimizationAuditPassed,
    legacyDispatchWiringPassed,
    liveOrchestrationWiringPassed,
    relatedDocsReferenced,
    capabilitiesDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatDeliveryOrchestrationP3_147AuditLines(
  summary: DeliveryOrchestrationP3_147AuditSummary,
): string[] {
  return [
    `Delivery orchestration Olo audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${DELIVERY_ORCHESTRATION_P3_147_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Route optimization audit: ${summary.routeOptimizationAuditPassed ? "PASS" : "FAIL"}`,
    `Legacy dispatch wiring: ${summary.legacyDispatchWiringPassed ? "PASS" : "FAIL"}`,
    `Live orchestration hub: ${summary.liveOrchestrationWiringPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `6 capabilities documented: ${summary.capabilitiesDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
