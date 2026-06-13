import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SOCIAL_PROOF_SECTION_P3_67_DOC,
  SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT,
  SOCIAL_PROOF_SECTION_P3_67_NPM_SCRIPTS,
  SOCIAL_PROOF_SECTION_P3_67_POLICY_ID,
  SOCIAL_PROOF_SECTION_P3_67_TEST_ID,
  SOCIAL_PROOF_SECTION_P3_67_WIRING_PATHS,
} from "@/lib/marketing/social-proof-section-p3-67-policy";
import { validateSocialProofSectionContract } from "@/lib/marketing/social-proof-section-p3-67-measurement";

export type SocialProofSectionP3_67AuditSummary = {
  policyId: typeof SOCIAL_PROOF_SECTION_P3_67_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  landingsWired: number;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditSocialProofSectionP3_67(
  root = process.cwd(),
): SocialProofSectionP3_67AuditSummary {
  const wiringComplete = SOCIAL_PROOF_SECTION_P3_67_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, SOCIAL_PROOF_SECTION_P3_67_DOC))) {
    const source = readFileSync(join(root, SOCIAL_PROOF_SECTION_P3_67_DOC), "utf8");
    docWired =
      source.includes(SOCIAL_PROOF_SECTION_P3_67_POLICY_ID) &&
      source.includes(SOCIAL_PROOF_SECTION_P3_67_TEST_ID) &&
      source.includes("Illustrative placeholder");
  }

  const contract = validateSocialProofSectionContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = SOCIAL_PROOF_SECTION_P3_67_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    contract.passed &&
    contract.landingsWired >= SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT &&
    npmScriptsWired;

  return {
    policyId: SOCIAL_PROOF_SECTION_P3_67_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    landingsWired: contract.landingsWired,
    npmScriptsWired,
    passed,
  };
}

export function formatSocialProofSectionP3_67AuditLines(
  summary: SocialProofSectionP3_67AuditSummary,
): string[] {
  return [
    `Social proof section audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${SOCIAL_PROOF_SECTION_P3_67_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Landings wired: ${summary.landingsWired}/${SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
