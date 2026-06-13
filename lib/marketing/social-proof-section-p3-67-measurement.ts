import {
  auditSocialProofSectionWiring,
  landingUsesSocialProofSection,
} from "@/lib/marketing/social-proof-section-audit";
import {
  SOCIAL_PROOF_SECTION_P3_67_LANDING_COMPONENTS,
  SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT,
} from "@/lib/marketing/social-proof-section-p3-67-policy";

export type SocialProofSectionContractValidation = {
  passed: boolean;
  componentWiringOk: boolean;
  landingsWired: number;
  landingsWiredOk: boolean;
  failures: string[];
};

export function validateSocialProofSectionContract(
  root = process.cwd(),
): SocialProofSectionContractValidation {
  const failures: string[] = [];

  const componentAudit = auditSocialProofSectionWiring(root);
  if (!componentAudit.ok) {
    failures.push(...componentAudit.failures);
  }

  const missingLandings = SOCIAL_PROOF_SECTION_P3_67_LANDING_COMPONENTS.filter(
    (rel) => !landingUsesSocialProofSection(rel, root),
  );
  const landingsWired =
    SOCIAL_PROOF_SECTION_P3_67_LANDING_COMPONENTS.length - missingLandings.length;
  const landingsWiredOk = missingLandings.length === 0;

  if (!landingsWiredOk) {
    failures.push(`landings missing SocialProofSection: ${missingLandings.join(", ")}`);
  }

  if (landingsWired < SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT) {
    failures.push(
      `expected at least ${SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT} wired landings, got ${landingsWired}`,
    );
  }

  return {
    passed: failures.length === 0 && componentAudit.ok && landingsWiredOk,
    componentWiringOk: componentAudit.ok,
    landingsWired,
    landingsWiredOk,
    failures,
  };
}
