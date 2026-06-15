import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditExternalSeriesAReferences,
  loadSeriesAReferenceAuditArtifact,
  validateSeriesAReferenceAuditArtifact,
} from "@/lib/pm/remove-series-a-p3-130-operations";
import {
  REMOVE_SERIES_A_AUDIT_ARTIFACT,
  REMOVE_SERIES_A_DECK_SURFACES,
  REMOVE_SERIES_A_DOC,
  REMOVE_SERIES_A_EMAIL_SURFACES,
  REMOVE_SERIES_A_HOLD_DOC,
  REMOVE_SERIES_A_HONESTY_MARKERS,
  REMOVE_SERIES_A_LANDING_SURFACES,
  REMOVE_SERIES_A_POLICY_ID,
  REMOVE_SERIES_A_RELATED_PATHS,
  REMOVE_SERIES_A_REPLACEMENT_PHRASES,
  REMOVE_SERIES_A_WIRING_PATHS,
} from "@/lib/pm/remove-series-a-p3-130-policy";

export type RemoveSeriesAAuditSummary = {
  policyId: typeof REMOVE_SERIES_A_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  externalSurfacesClean: boolean;
  artifactValid: boolean;
  relatedPathsReferenced: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditRemoveSeriesA(root = process.cwd()): RemoveSeriesAAuditSummary {
  const wiringComplete = REMOVE_SERIES_A_WIRING_PATHS.every((rel) => existsSync(join(root, rel)));

  let docWired = false;
  let relatedPathsReferenced = false;

  if (existsSync(join(root, REMOVE_SERIES_A_DOC))) {
    const source = readFileSync(join(root, REMOVE_SERIES_A_DOC), "utf8");
    docWired =
      REMOVE_SERIES_A_DECK_SURFACES.every((surface) => source.includes(surface.path)) &&
      REMOVE_SERIES_A_LANDING_SURFACES.every((surface) => source.includes(surface.path)) &&
      REMOVE_SERIES_A_EMAIL_SURFACES.every((surface) => source.includes(surface.path)) &&
      source.includes(REMOVE_SERIES_A_HOLD_DOC);
    relatedPathsReferenced = REMOVE_SERIES_A_RELATED_PATHS.every((path) => source.includes(path));
  }

  const externalAudit = auditExternalSeriesAReferences(root);
  const externalSurfacesClean = externalAudit.allClean;

  let artifactValid = false;
  if (existsSync(join(root, REMOVE_SERIES_A_AUDIT_ARTIFACT))) {
    const artifact = loadSeriesAReferenceAuditArtifact(root);
    artifactValid = validateSeriesAReferenceAuditArtifact(artifact);
  }

  const combinedSources = [REMOVE_SERIES_A_DOC, REMOVE_SERIES_A_AUDIT_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent =
    REMOVE_SERIES_A_HONESTY_MARKERS.every((marker) => combinedSources.includes(marker)) &&
    REMOVE_SERIES_A_REPLACEMENT_PHRASES.every((phrase) => combinedSources.includes(phrase));

  const passed =
    wiringComplete &&
    docWired &&
    externalSurfacesClean &&
    artifactValid &&
    relatedPathsReferenced &&
    honestyMarkersPresent;

  return {
    policyId: REMOVE_SERIES_A_POLICY_ID,
    wiringComplete,
    docWired,
    externalSurfacesClean,
    artifactValid,
    relatedPathsReferenced,
    honestyMarkersPresent,
    passed,
  };
}

export function formatRemoveSeriesAAuditLines(summary: RemoveSeriesAAuditSummary): string[] {
  return [
    `Remove Series A references audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${REMOVE_SERIES_A_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `External surfaces clean: ${summary.externalSurfacesClean ? "yes" : "no"}`,
    `Artifact valid: ${summary.artifactValid ? "yes" : "no"}`,
    `Related paths referenced: ${summary.relatedPathsReferenced ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
