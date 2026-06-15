import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkHardwareCompatibilityRoadmapLiveCertifiedGuideAudit,
  checkHardwareCompatibilityRoadmapLiveCompatCenterAudit,
  loadHardwareCompatibilityRoadmapRegistry,
  validateHardwareCompatibilityRoadmapRegistry,
} from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-operations";
import {
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ARTIFACT,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_COMPETITOR,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_HEADLINE,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_HONESTY_MARKERS,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_IMPLEMENTATION_REF,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POSITIONING_LINE,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_RELATED_DOCS,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROUTE,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_WIRING_PATHS,
} from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-policy";

export type HardwareCompatibilityRoadmapP3_146AuditSummary = {
  policyId: typeof HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveCompatCenterPassed: boolean;
  liveCertifiedGuidePassed: boolean;
  relatedDocsReferenced: boolean;
  roadmapItemsDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditHardwareCompatibilityRoadmapP3_146(
  root = process.cwd(),
): HardwareCompatibilityRoadmapP3_146AuditSummary {
  const wiringComplete = HARDWARE_COMPATIBILITY_ROADMAP_P3_146_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let roadmapItemsDocumented = false;

  if (existsSync(join(root, HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC))) {
    const source = readFileSync(join(root, HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC), "utf8");
    docWired =
      source.includes(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_HEADLINE) &&
      source.includes(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POSITIONING_LINE) &&
      source.includes(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_COMPETITOR) &&
      source.includes(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_IMPLEMENTATION_REF) &&
      source.includes(String(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT)) &&
      source.includes(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROUTE);
    relatedDocsReferenced = HARDWARE_COMPATIBILITY_ROADMAP_P3_146_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    roadmapItemsDocumented = HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS.every(
      (itemId) => source.includes(itemId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ARTIFACT))) {
    const registry = loadHardwareCompatibilityRoadmapRegistry(root);
    registryValid = validateHardwareCompatibilityRoadmapRegistry(registry).valid;
  }

  const liveCompatCenterPassed = checkHardwareCompatibilityRoadmapLiveCompatCenterAudit(root);
  const liveCertifiedGuidePassed = checkHardwareCompatibilityRoadmapLiveCertifiedGuideAudit(root);

  const combinedSources = [
    HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC,
    HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ARTIFACT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = HARDWARE_COMPATIBILITY_ROADMAP_P3_146_HONESTY_MARKERS.every(
    (marker) => combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveCompatCenterPassed &&
    liveCertifiedGuidePassed &&
    relatedDocsReferenced &&
    roadmapItemsDocumented &&
    honestyMarkersPresent;

  return {
    policyId: HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveCompatCenterPassed,
    liveCertifiedGuidePassed,
    relatedDocsReferenced,
    roadmapItemsDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatHardwareCompatibilityRoadmapP3_146AuditLines(
  summary: HardwareCompatibilityRoadmapP3_146AuditSummary,
): string[] {
  return [
    `Hardware compatibility roadmap audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live compat center: ${summary.liveCompatCenterPassed ? "PASS" : "FAIL"}`,
    `Live certified hardware guide: ${summary.liveCertifiedGuidePassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `6 roadmap items documented: ${summary.roadmapItemsDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
