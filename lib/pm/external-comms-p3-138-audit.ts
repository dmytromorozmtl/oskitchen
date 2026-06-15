import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkExternalCommsLiveForbiddenClaimsAudit,
  loadExternalCommsPolicyPmRegistry,
  validateExternalCommsPolicyPmRegistry,
} from "@/lib/pm/external-comms-p3-138-operations";
import {
  EXTERNAL_COMMS_P3_138_APPROVAL_FLOW,
  EXTERNAL_COMMS_P3_138_ARTIFACT,
  EXTERNAL_COMMS_P3_138_CHANNEL_IDS,
  EXTERNAL_COMMS_P3_138_DOC,
  EXTERNAL_COMMS_P3_138_HONESTY_MARKERS,
  EXTERNAL_COMMS_P3_138_IMPLEMENTATION_REFS,
  EXTERNAL_COMMS_P3_138_POLICY_ID,
  EXTERNAL_COMMS_P3_138_PROOF_RULE,
  EXTERNAL_COMMS_P3_138_RELATED_DOCS,
  EXTERNAL_COMMS_P3_138_WIRING_PATHS,
} from "@/lib/pm/external-comms-p3-138-policy";

export type ExternalCommsP3_138AuditSummary = {
  policyId: typeof EXTERNAL_COMMS_P3_138_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveForbiddenClaimsPassed: boolean;
  relatedDocsReferenced: boolean;
  channelsDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditExternalCommsP3_138(root = process.cwd()): ExternalCommsP3_138AuditSummary {
  const wiringComplete = EXTERNAL_COMMS_P3_138_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let channelsDocumented = false;

  if (existsSync(join(root, EXTERNAL_COMMS_P3_138_DOC))) {
    const source = readFileSync(join(root, EXTERNAL_COMMS_P3_138_DOC), "utf8");
    docWired =
      source.includes(EXTERNAL_COMMS_P3_138_PROOF_RULE) &&
      source.includes(EXTERNAL_COMMS_P3_138_APPROVAL_FLOW) &&
      source.includes(EXTERNAL_COMMS_P3_138_IMPLEMENTATION_REFS.forbiddenClaimsAudit) &&
      source.includes(EXTERNAL_COMMS_P3_138_IMPLEMENTATION_REFS.forbiddenClaimsTraining);
    relatedDocsReferenced = EXTERNAL_COMMS_P3_138_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    channelsDocumented = EXTERNAL_COMMS_P3_138_CHANNEL_IDS.every((channelId) =>
      source.includes(channelId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, EXTERNAL_COMMS_P3_138_ARTIFACT))) {
    const registry = loadExternalCommsPolicyPmRegistry(root);
    registryValid = validateExternalCommsPolicyPmRegistry(registry).valid;
  }

  const liveForbiddenClaimsPassed = checkExternalCommsLiveForbiddenClaimsAudit(root);

  const combinedSources = [EXTERNAL_COMMS_P3_138_DOC, EXTERNAL_COMMS_P3_138_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = EXTERNAL_COMMS_P3_138_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveForbiddenClaimsPassed &&
    relatedDocsReferenced &&
    channelsDocumented &&
    honestyMarkersPresent;

  return {
    policyId: EXTERNAL_COMMS_P3_138_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveForbiddenClaimsPassed,
    relatedDocsReferenced,
    channelsDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatExternalCommsP3_138AuditLines(
  summary: ExternalCommsP3_138AuditSummary,
): string[] {
  return [
    `External comms PM audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${EXTERNAL_COMMS_P3_138_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live forbidden-claims audit: ${summary.liveForbiddenClaimsPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Channels documented: ${summary.channelsDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
