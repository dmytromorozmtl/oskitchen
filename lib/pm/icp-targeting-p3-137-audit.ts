import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkIcpTargetingLiveLandingPages,
  loadIcpTargetingPmRegistry,
  validateIcpTargetingPmRegistry,
} from "@/lib/pm/icp-targeting-p3-137-operations";
import {
  ICP_TARGETING_P3_137_ARTIFACT,
  ICP_TARGETING_P3_137_DOC,
  ICP_TARGETING_P3_137_HONESTY_MARKERS,
  ICP_TARGETING_P3_137_ICP_SCORE_TARGET,
  ICP_TARGETING_P3_137_IMPLEMENTATION_REFS,
  ICP_TARGETING_P3_137_LANDING_PATHS,
  ICP_TARGETING_P3_137_LOI_SLOTS,
  ICP_TARGETING_P3_137_POLICY_ID,
  ICP_TARGETING_P3_137_PROFILE_IDS,
  ICP_TARGETING_P3_137_RELATED_DOCS,
  ICP_TARGETING_P3_137_WIRING_PATHS,
} from "@/lib/pm/icp-targeting-p3-137-policy";

export type IcpTargetingP3_137AuditSummary = {
  policyId: typeof ICP_TARGETING_P3_137_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveLandingPagesPassed: boolean;
  relatedDocsReferenced: boolean;
  profilesDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditIcpTargetingP3_137(root = process.cwd()): IcpTargetingP3_137AuditSummary {
  const wiringComplete = ICP_TARGETING_P3_137_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let profilesDocumented = false;

  if (existsSync(join(root, ICP_TARGETING_P3_137_DOC))) {
    const source = readFileSync(join(root, ICP_TARGETING_P3_137_DOC), "utf8");
    docWired =
      source.includes(ICP_TARGETING_P3_137_LANDING_PATHS.meal_prep) &&
      source.includes(ICP_TARGETING_P3_137_LANDING_PATHS.ghost_kitchen) &&
      source.includes(ICP_TARGETING_P3_137_LOI_SLOTS.meal_prep) &&
      source.includes(ICP_TARGETING_P3_137_LOI_SLOTS.ghost_kitchen) &&
      source.includes(`≥${ICP_TARGETING_P3_137_ICP_SCORE_TARGET}/10`) &&
      source.includes(ICP_TARGETING_P3_137_IMPLEMENTATION_REFS.icpDefinition);
    relatedDocsReferenced = ICP_TARGETING_P3_137_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    profilesDocumented = ICP_TARGETING_P3_137_PROFILE_IDS.every((profileId) =>
      source.includes(profileId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, ICP_TARGETING_P3_137_ARTIFACT))) {
    const registry = loadIcpTargetingPmRegistry(root);
    registryValid = validateIcpTargetingPmRegistry(registry).valid;
  }

  const liveLandingPagesPassed = checkIcpTargetingLiveLandingPages(root);

  const combinedSources = [ICP_TARGETING_P3_137_DOC, ICP_TARGETING_P3_137_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = ICP_TARGETING_P3_137_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveLandingPagesPassed &&
    relatedDocsReferenced &&
    profilesDocumented &&
    honestyMarkersPresent;

  return {
    policyId: ICP_TARGETING_P3_137_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveLandingPagesPassed,
    relatedDocsReferenced,
    profilesDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatIcpTargetingP3_137AuditLines(
  summary: IcpTargetingP3_137AuditSummary,
): string[] {
  return [
    `ICP targeting PM audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${ICP_TARGETING_P3_137_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live ICP landing pages: ${summary.liveLandingPagesPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Profiles documented: ${summary.profilesDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
