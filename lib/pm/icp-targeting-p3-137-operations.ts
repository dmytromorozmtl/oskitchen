import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditIcpLandingPages } from "@/lib/marketing/icp-landing-pages-audit";
import {
  GHOST_KITCHEN_SOFTWARE_ICP_PATH,
  MEAL_PREP_SOFTWARE_ICP_PATH,
} from "@/lib/marketing/icp-landing-pages-policy";
import {
  ICP_TARGETING_P3_137_ICP_SCORE_TARGET,
  ICP_TARGETING_P3_137_POLICY_ID,
  ICP_TARGETING_P3_137_PROFILE_IDS,
  ICP_TARGETING_P3_137_WAVE1_ORDER,
} from "@/lib/pm/icp-targeting-p3-137-policy";

export type IcpTargetingProfileRecord = {
  id: string;
  label: string;
  priority: string;
  wave: number;
  landingPath: string;
  demoSlug: string;
  loiSlotId: string;
  orderVolumeRange: string;
  icpScoreTarget: number;
  utmCampaign: string;
  status: string;
  qualifiedCount: number;
};

export type IcpTargetingPmRegistry = {
  version: string;
  policyId: typeof ICP_TARGETING_P3_137_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  wave1OutreachOrder: string[];
  implementationRefs: Record<string, string>;
  targetSignedLoiCount: number;
  qualifiedProspectCount: number;
  profiles: IcpTargetingProfileRecord[];
};

export function loadIcpTargetingPmRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/icp-targeting-pm-registry.json",
): IcpTargetingPmRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as IcpTargetingPmRegistry;
}

export function validateIcpTargetingPmRegistry(
  registry: IcpTargetingPmRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  profilesComplete: boolean;
  wave1OrderMatches: boolean;
  zeroQualified: boolean;
} {
  const policyIdMatches = registry.policyId === ICP_TARGETING_P3_137_POLICY_ID;

  const profilesComplete =
    registry.profiles.length === ICP_TARGETING_P3_137_PROFILE_IDS.length &&
    ICP_TARGETING_P3_137_PROFILE_IDS.every((profileId, index) => {
      const profile = registry.profiles[index];
      if (!profile || profile.id !== profileId) {
        return false;
      }
      if (profileId === "meal_prep") {
        return (
          profile.landingPath === MEAL_PREP_SOFTWARE_ICP_PATH &&
          profile.loiSlotId === "slot-3-meal-prep" &&
          profile.icpScoreTarget === ICP_TARGETING_P3_137_ICP_SCORE_TARGET
        );
      }
      return (
        profile.landingPath === GHOST_KITCHEN_SOFTWARE_ICP_PATH &&
        profile.loiSlotId === "slot-1-ghost-kitchen" &&
        profile.icpScoreTarget === ICP_TARGETING_P3_137_ICP_SCORE_TARGET
      );
    });

  const wave1OrderMatches =
    registry.wave1OutreachOrder.length === ICP_TARGETING_P3_137_WAVE1_ORDER.length &&
    ICP_TARGETING_P3_137_WAVE1_ORDER.every(
      (profileId, index) => registry.wave1OutreachOrder[index] === profileId,
    );

  const zeroQualified =
    registry.qualifiedProspectCount === 0 &&
    registry.profiles.every(
      (profile) => profile.qualifiedCount === 0 && profile.status === "template_only",
    );

  const valid = policyIdMatches && profilesComplete && wave1OrderMatches && zeroQualified;

  return {
    valid,
    policyIdMatches,
    profilesComplete,
    wave1OrderMatches,
    zeroQualified,
  };
}

export function checkIcpTargetingLiveLandingPages(root = process.cwd()): boolean {
  const summary = auditIcpLandingPages(root);
  return summary.passed;
}
