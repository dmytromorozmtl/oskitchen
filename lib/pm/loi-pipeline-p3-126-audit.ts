import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadLoiPipelineShortlist,
  validateLoiPipelineShortlist,
} from "@/lib/pm/loi-pipeline-p3-126-operations";
import {
  LOI_PIPELINE_DISCOVERY_CALL_MINUTES,
  LOI_PIPELINE_DOC,
  LOI_PIPELINE_HONESTY_MARKERS,
  LOI_PIPELINE_POLICY_ID,
  LOI_PIPELINE_RELATED_DOCS,
  LOI_PIPELINE_SHORTLIST_ARTIFACT,
  LOI_PIPELINE_SHORTLIST_SLOTS,
  LOI_PIPELINE_STAGES,
  LOI_PIPELINE_TARGET_SIGNED_LOI_COUNT,
  LOI_PIPELINE_WIRING_PATHS,
} from "@/lib/pm/loi-pipeline-p3-126-policy";

export type LoiPipelineAuditSummary = {
  policyId: typeof LOI_PIPELINE_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  shortlistValid: boolean;
  relatedDocsReferenced: boolean;
  discoveryCallWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditLoiPipeline(root = process.cwd()): LoiPipelineAuditSummary {
  const wiringComplete = LOI_PIPELINE_WIRING_PATHS.every((rel) => existsSync(join(root, rel)));

  let docWired = false;
  let relatedDocsReferenced = false;
  let discoveryCallWired = false;

  if (existsSync(join(root, LOI_PIPELINE_DOC))) {
    const source = readFileSync(join(root, LOI_PIPELINE_DOC), "utf8");
    docWired =
      LOI_PIPELINE_SHORTLIST_SLOTS.every((slot) => source.includes(slot.id)) &&
      LOI_PIPELINE_STAGES.every((stage) => source.includes(stage)) &&
      source.includes(String(LOI_PIPELINE_TARGET_SIGNED_LOI_COUNT));
    relatedDocsReferenced = LOI_PIPELINE_RELATED_DOCS.every((doc) => source.includes(doc));
    discoveryCallWired =
      source.includes("docs/DEMO_CALL_SCRIPT.md") &&
      source.includes(String(LOI_PIPELINE_DISCOVERY_CALL_MINUTES));
  }

  let shortlistValid = false;
  if (existsSync(join(root, LOI_PIPELINE_SHORTLIST_ARTIFACT))) {
    const shortlist = loadLoiPipelineShortlist(root);
    shortlistValid = validateLoiPipelineShortlist(shortlist).valid;
  }

  const combinedSources = [LOI_PIPELINE_DOC, LOI_PIPELINE_SHORTLIST_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = LOI_PIPELINE_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    shortlistValid &&
    relatedDocsReferenced &&
    discoveryCallWired &&
    honestyMarkersPresent;

  return {
    policyId: LOI_PIPELINE_POLICY_ID,
    wiringComplete,
    docWired,
    shortlistValid,
    relatedDocsReferenced,
    discoveryCallWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatLoiPipelineAuditLines(summary: LoiPipelineAuditSummary): string[] {
  return [
    `LOI pipeline audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${LOI_PIPELINE_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Shortlist artifact: ${summary.shortlistValid ? "yes" : "no"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Discovery call wired: ${summary.discoveryCallWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
