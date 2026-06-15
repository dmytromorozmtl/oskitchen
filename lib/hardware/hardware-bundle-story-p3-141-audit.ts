import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkHardwareBundleStoryLiveCertifiedGuideAudit,
  loadHardwareBundleStoryRegistry,
  validateHardwareBundleStoryRegistry,
} from "@/lib/hardware/hardware-bundle-story-p3-141-operations";
import {
  HARDWARE_BUNDLE_STORY_P3_141_ARTIFACT,
  HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS,
  HARDWARE_BUNDLE_STORY_P3_141_COMPETITOR,
  HARDWARE_BUNDLE_STORY_P3_141_DOC,
  HARDWARE_BUNDLE_STORY_P3_141_HONESTY_MARKERS,
  HARDWARE_BUNDLE_STORY_P3_141_IMPLEMENTATION_REF,
  HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID,
  HARDWARE_BUNDLE_STORY_P3_141_POSITIONING_LINE,
  HARDWARE_BUNDLE_STORY_P3_141_RELATED_DOCS,
  HARDWARE_BUNDLE_STORY_P3_141_WIRING_PATHS,
} from "@/lib/hardware/hardware-bundle-story-p3-141-policy";

export type HardwareBundleStoryP3_141AuditSummary = {
  policyId: typeof HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveCertifiedGuidePassed: boolean;
  relatedDocsReferenced: boolean;
  componentsDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditHardwareBundleStoryP3_141(
  root = process.cwd(),
): HardwareBundleStoryP3_141AuditSummary {
  const wiringComplete = HARDWARE_BUNDLE_STORY_P3_141_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let componentsDocumented = false;

  if (existsSync(join(root, HARDWARE_BUNDLE_STORY_P3_141_DOC))) {
    const source = readFileSync(join(root, HARDWARE_BUNDLE_STORY_P3_141_DOC), "utf8");
    docWired =
      source.includes(HARDWARE_BUNDLE_STORY_P3_141_POSITIONING_LINE) &&
      source.includes(HARDWARE_BUNDLE_STORY_P3_141_COMPETITOR) &&
      source.includes(HARDWARE_BUNDLE_STORY_P3_141_IMPLEMENTATION_REF) &&
      source.includes("Stripe Terminal");
    relatedDocsReferenced = HARDWARE_BUNDLE_STORY_P3_141_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    componentsDocumented = HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS.every((componentId) =>
      source.includes(componentId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, HARDWARE_BUNDLE_STORY_P3_141_ARTIFACT))) {
    const registry = loadHardwareBundleStoryRegistry(root);
    registryValid = validateHardwareBundleStoryRegistry(registry).valid;
  }

  const liveCertifiedGuidePassed = checkHardwareBundleStoryLiveCertifiedGuideAudit(root);

  const combinedSources = [HARDWARE_BUNDLE_STORY_P3_141_DOC, HARDWARE_BUNDLE_STORY_P3_141_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = HARDWARE_BUNDLE_STORY_P3_141_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveCertifiedGuidePassed &&
    relatedDocsReferenced &&
    componentsDocumented &&
    honestyMarkersPresent;

  return {
    policyId: HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveCertifiedGuidePassed,
    relatedDocsReferenced,
    componentsDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatHardwareBundleStoryP3_141AuditLines(
  summary: HardwareBundleStoryP3_141AuditSummary,
): string[] {
  return [
    `Hardware bundle story audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${HARDWARE_BUNDLE_STORY_P3_141_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live certified hardware guide: ${summary.liveCertifiedGuidePassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Bundle components documented: ${summary.componentsDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
