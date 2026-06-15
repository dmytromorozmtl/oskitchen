import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadFeatureGraduationRegistry,
  validateFeatureGraduationRegistry,
} from "@/lib/pm/feature-graduation-p3-132-operations";
import {
  FEATURE_GRADUATION_ARTIFACT,
  FEATURE_GRADUATION_DOC,
  FEATURE_GRADUATION_FEATURE_IDS,
  FEATURE_GRADUATION_GATES,
  FEATURE_GRADUATION_HONESTY_MARKERS,
  FEATURE_GRADUATION_POLICY_ID,
  FEATURE_GRADUATION_RELATED_DOCS,
  FEATURE_GRADUATION_WIRING_PATHS,
} from "@/lib/pm/feature-graduation-p3-132-policy";

export type FeatureGraduationAuditSummary = {
  policyId: typeof FEATURE_GRADUATION_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  relatedDocsReferenced: boolean;
  gatesDocumented: boolean;
  featuresDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditFeatureGraduation(root = process.cwd()): FeatureGraduationAuditSummary {
  const wiringComplete = FEATURE_GRADUATION_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let gatesDocumented = false;
  let featuresDocumented = false;

  if (existsSync(join(root, FEATURE_GRADUATION_DOC))) {
    const source = readFileSync(join(root, FEATURE_GRADUATION_DOC), "utf8");
    docWired =
      FEATURE_GRADUATION_GATES.every(
        (gate) => source.includes(gate.id) && source.includes(gate.label),
      ) &&
      source.includes(">85%") &&
      source.includes("accuracy_benchmark") &&
      source.includes("e2e_pass") &&
      source.includes("merchant_proof");
    relatedDocsReferenced = FEATURE_GRADUATION_RELATED_DOCS.every((doc) => source.includes(doc));
    gatesDocumented = FEATURE_GRADUATION_GATES.every((gate) => source.includes(gate.id));
    featuresDocumented = FEATURE_GRADUATION_FEATURE_IDS.every((featureId) =>
      source.includes(featureId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, FEATURE_GRADUATION_ARTIFACT))) {
    const registry = loadFeatureGraduationRegistry(root);
    registryValid = validateFeatureGraduationRegistry(registry).valid;
  }

  const combinedSources = [FEATURE_GRADUATION_DOC, FEATURE_GRADUATION_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = FEATURE_GRADUATION_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    relatedDocsReferenced &&
    gatesDocumented &&
    featuresDocumented &&
    honestyMarkersPresent;

  return {
    policyId: FEATURE_GRADUATION_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    relatedDocsReferenced,
    gatesDocumented,
    featuresDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatFeatureGraduationAuditLines(
  summary: FeatureGraduationAuditSummary,
): string[] {
  return [
    `Feature graduation audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${FEATURE_GRADUATION_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Gates documented: ${summary.gatesDocumented ? "yes" : "no"}`,
    `Features documented: ${summary.featuresDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
