import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadBusFactorP3_134Registry,
  loadEmergencyAccessChecklist,
  validateBusFactorP3_134Registry,
  validateEmergencyAccessChecklist,
} from "@/lib/pm/bus-factor-p3-134-operations";
import {
  BUS_FACTOR_P3_134_ADR_FILES,
  BUS_FACTOR_P3_134_DOC,
  BUS_FACTOR_P3_134_EMERGENCY_ARTIFACT,
  BUS_FACTOR_P3_134_HONESTY_MARKERS,
  BUS_FACTOR_P3_134_POLICY_ID,
  BUS_FACTOR_P3_134_REGISTRY_ARTIFACT,
  BUS_FACTOR_P3_134_RELATED_DOCS,
  BUS_FACTOR_P3_134_VIDEO_CATALOG_DOC,
  BUS_FACTOR_P3_134_VIDEO_TARGET,
  BUS_FACTOR_P3_134_WIRING_PATHS,
} from "@/lib/pm/bus-factor-p3-134-policy";

export type BusFactorP3_134AuditSummary = {
  policyId: typeof BUS_FACTOR_P3_134_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  videoCatalogWired: boolean;
  registryValid: boolean;
  emergencyChecklistValid: boolean;
  relatedDocsReferenced: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditBusFactorP3_134(root = process.cwd()): BusFactorP3_134AuditSummary {
  const wiringComplete = BUS_FACTOR_P3_134_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let videoCatalogWired = false;
  let relatedDocsReferenced = false;

  if (existsSync(join(root, BUS_FACTOR_P3_134_DOC))) {
    const source = readFileSync(join(root, BUS_FACTOR_P3_134_DOC), "utf8");
    docWired =
      source.includes(String(BUS_FACTOR_P3_134_VIDEO_TARGET)) &&
      source.includes(BUS_FACTOR_P3_134_EMERGENCY_ARTIFACT) &&
      source.includes(BUS_FACTOR_P3_134_VIDEO_CATALOG_DOC);
    relatedDocsReferenced = BUS_FACTOR_P3_134_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
  }

  if (existsSync(join(root, BUS_FACTOR_P3_134_VIDEO_CATALOG_DOC))) {
    const catalog = readFileSync(join(root, BUS_FACTOR_P3_134_VIDEO_CATALOG_DOC), "utf8");
    videoCatalogWired =
      BUS_FACTOR_P3_134_ADR_FILES.every((adrPath) => {
        const adrBasename = adrPath.split("/").pop()?.replace(".md", "") ?? "";
        return catalog.includes(adrBasename);
      }) && catalog.includes("0 / 10");
  }

  let registryValid = false;
  if (existsSync(join(root, BUS_FACTOR_P3_134_REGISTRY_ARTIFACT))) {
    const registry = loadBusFactorP3_134Registry(root);
    registryValid = validateBusFactorP3_134Registry(registry).valid;
  }

  let emergencyChecklistValid = false;
  if (existsSync(join(root, BUS_FACTOR_P3_134_EMERGENCY_ARTIFACT))) {
    const checklist = loadEmergencyAccessChecklist(root);
    emergencyChecklistValid = validateEmergencyAccessChecklist(checklist).valid;
  }

  const combinedSources = [
    BUS_FACTOR_P3_134_DOC,
    BUS_FACTOR_P3_134_VIDEO_CATALOG_DOC,
    BUS_FACTOR_P3_134_REGISTRY_ARTIFACT,
    BUS_FACTOR_P3_134_EMERGENCY_ARTIFACT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = BUS_FACTOR_P3_134_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    videoCatalogWired &&
    registryValid &&
    emergencyChecklistValid &&
    relatedDocsReferenced &&
    honestyMarkersPresent;

  return {
    policyId: BUS_FACTOR_P3_134_POLICY_ID,
    wiringComplete,
    docWired,
    videoCatalogWired,
    registryValid,
    emergencyChecklistValid,
    relatedDocsReferenced,
    honestyMarkersPresent,
    passed,
  };
}

export function formatBusFactorP3_134AuditLines(
  summary: BusFactorP3_134AuditSummary,
): string[] {
  return [
    `Bus factor PM audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${BUS_FACTOR_P3_134_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `ADR video catalog: ${summary.videoCatalogWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Emergency checklist: ${summary.emergencyChecklistValid ? "yes" : "no"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
