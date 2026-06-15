import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkInventoryReservationsDepthLiveWiring,
  loadInventoryReservationsDepthRegistry,
  validateInventoryReservationsDepthRegistry,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-operations";
import {
  INVENTORY_RESERVATIONS_DEPTH_P3_144_ARTIFACT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPETITOR,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_HONESTY_MARKERS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RELATED_DOCS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_TOTAL_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_WIRING_PATHS,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-policy";

export type InventoryReservationsDepthP3_144AuditSummary = {
  policyId: typeof INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveDepthWiringPassed: boolean;
  relatedDocsReferenced: boolean;
  capabilitiesDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditInventoryReservationsDepthP3_144(
  root = process.cwd(),
): InventoryReservationsDepthP3_144AuditSummary {
  const wiringComplete = INVENTORY_RESERVATIONS_DEPTH_P3_144_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let capabilitiesDocumented = false;

  if (existsSync(join(root, INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC))) {
    const source = readFileSync(join(root, INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC), "utf8");
    docWired =
      source.includes(INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE) &&
      source.includes(INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPETITOR) &&
      source.includes(String(INVENTORY_RESERVATIONS_DEPTH_P3_144_TOTAL_CAPABILITY_COUNT)) &&
      source.includes(INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE) &&
      source.includes(INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE);
    relatedDocsReferenced = INVENTORY_RESERVATIONS_DEPTH_P3_144_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    const allCapabilityIds = [
      ...INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS,
      ...INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS,
    ];
    capabilitiesDocumented = allCapabilityIds.every((capabilityId) =>
      source.includes(capabilityId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, INVENTORY_RESERVATIONS_DEPTH_P3_144_ARTIFACT))) {
    const registry = loadInventoryReservationsDepthRegistry(root);
    registryValid = validateInventoryReservationsDepthRegistry(registry).valid;
  }

  const liveDepthWiringPassed = checkInventoryReservationsDepthLiveWiring(root);

  const combinedSources = [INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC, INVENTORY_RESERVATIONS_DEPTH_P3_144_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = INVENTORY_RESERVATIONS_DEPTH_P3_144_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveDepthWiringPassed &&
    relatedDocsReferenced &&
    capabilitiesDocumented &&
    honestyMarkersPresent;

  return {
    policyId: INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveDepthWiringPassed,
    relatedDocsReferenced,
    capabilitiesDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatInventoryReservationsDepthP3_144AuditLines(
  summary: InventoryReservationsDepthP3_144AuditSummary,
): string[] {
  return [
    `Inventory + reservations depth audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live depth hub: ${summary.liveDepthWiringPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `9 capabilities documented: ${summary.capabilitiesDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
