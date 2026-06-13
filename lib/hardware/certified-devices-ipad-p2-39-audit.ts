import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CERTIFIED_DEVICES_IPAD_P2_39_DISCLAIMER,
  CERTIFIED_DEVICES_IPAD_P2_39_MODELS,
  assertCertifiedDevicesIpadP2_39ModelCount,
  countCertifiedDevicesIpadP2_39ByTier,
} from "@/lib/hardware/certified-devices-ipad-p2-39-content";
import {
  CERTIFIED_DEVICES_IPAD_P2_39_ARTIFACT,
  CERTIFIED_DEVICES_IPAD_P2_39_DOC,
  CERTIFIED_DEVICES_IPAD_P2_39_HONESTY_MARKERS,
  CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
  CERTIFIED_DEVICES_IPAD_P2_39_MODEL_COUNT,
  CERTIFIED_DEVICES_IPAD_P2_39_POLICY_ID,
  CERTIFIED_DEVICES_IPAD_P2_39_RELATED_DOCS,
  CERTIFIED_DEVICES_IPAD_P2_39_WIRING_PATHS,
} from "@/lib/hardware/certified-devices-ipad-p2-39-policy";

export type CertifiedDevicesIpadP2_39AuditSummary = {
  policyId: typeof CERTIFIED_DEVICES_IPAD_P2_39_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryPresent: boolean;
  modelCountCorrect: boolean;
  certifiedTierCount: number;
  allModelsInDoc: boolean;
  relatedDocsReferenced: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCertifiedDevicesIpadP2_39(
  root = process.cwd(),
): CertifiedDevicesIpadP2_39AuditSummary {
  const wiringComplete = CERTIFIED_DEVICES_IPAD_P2_39_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let allModelsInDoc = false;

  if (existsSync(join(root, CERTIFIED_DEVICES_IPAD_P2_39_DOC))) {
    const source = readFileSync(join(root, CERTIFIED_DEVICES_IPAD_P2_39_DOC), "utf8");
    docWired =
      source.includes(CERTIFIED_DEVICES_IPAD_P2_39_DISCLAIMER) &&
      source.includes(String(CERTIFIED_DEVICES_IPAD_P2_39_MODEL_COUNT)) &&
      source.includes(CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS);
    allModelsInDoc = CERTIFIED_DEVICES_IPAD_P2_39_MODELS.every(
      (m) => source.includes(m.id) && source.includes(m.model),
    );
  }

  const registryPresent = existsSync(join(root, CERTIFIED_DEVICES_IPAD_P2_39_ARTIFACT));

  const combined = [
    CERTIFIED_DEVICES_IPAD_P2_39_DOC,
    "lib/hardware/certified-devices-ipad-p2-39-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const relatedDocsReferenced = CERTIFIED_DEVICES_IPAD_P2_39_RELATED_DOCS.filter((rel) =>
    existsSync(join(root, rel)),
  ).every((rel) => combined.includes(rel.split("/").pop() ?? rel));

  const honestyMarkersPresent = CERTIFIED_DEVICES_IPAD_P2_39_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const modelCountCorrect = assertCertifiedDevicesIpadP2_39ModelCount();
  const certifiedTierCount = countCertifiedDevicesIpadP2_39ByTier("certified");

  const passed =
    wiringComplete &&
    docWired &&
    registryPresent &&
    modelCountCorrect &&
    certifiedTierCount >= 6 &&
    allModelsInDoc &&
    relatedDocsReferenced &&
    honestyMarkersPresent;

  return {
    policyId: CERTIFIED_DEVICES_IPAD_P2_39_POLICY_ID,
    wiringComplete,
    docWired,
    registryPresent,
    modelCountCorrect,
    certifiedTierCount,
    allModelsInDoc,
    relatedDocsReferenced,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCertifiedDevicesIpadP2_39AuditLines(
  summary: CertifiedDevicesIpadP2_39AuditSummary,
): string[] {
  return [
    `Certified iPad devices audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${CERTIFIED_DEVICES_IPAD_P2_39_DOC})`,
    `Registry artifact: ${summary.registryPresent ? "present" : "missing"}`,
    `Model count (${CERTIFIED_DEVICES_IPAD_P2_39_MODEL_COUNT}): ${summary.modelCountCorrect ? "yes" : "no"}`,
    `Certified tier models: ${summary.certifiedTierCount}`,
    `All models in doc: ${summary.allModelsInDoc ? "yes" : "no"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
