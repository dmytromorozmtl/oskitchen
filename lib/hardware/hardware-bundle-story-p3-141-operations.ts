import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCertifiedHardwareGuide } from "@/lib/hardware/certified-hardware-guide-audit";
import {
  HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS,
  HARDWARE_BUNDLE_STORY_P3_141_COMPETITOR,
  HARDWARE_BUNDLE_STORY_P3_141_IMPLEMENTATION_REF,
  HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID,
} from "@/lib/hardware/hardware-bundle-story-p3-141-policy";

export type HardwareBundleComponentRecord = {
  id: string;
  label: string;
  toastTypical: string;
  osKitchenPath: string;
  parityStatus: string;
};

export type HardwareBundleStoryRegistry = {
  version: string;
  policyId: typeof HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  implementationRef: string;
  certifiedTerminalProgram: boolean;
  bundleComponentCount: number;
  components: HardwareBundleComponentRecord[];
};

export function loadHardwareBundleStoryRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/hardware-bundle-story-registry.json",
): HardwareBundleStoryRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as HardwareBundleStoryRegistry;
}

export function validateHardwareBundleStoryRegistry(
  registry: HardwareBundleStoryRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  competitorMatches: boolean;
  componentsComplete: boolean;
  noCertifiedProgram: boolean;
} {
  const policyIdMatches = registry.policyId === HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID;

  const competitorMatches = registry.competitor === HARDWARE_BUNDLE_STORY_P3_141_COMPETITOR;

  const componentsComplete =
    registry.bundleComponentCount === HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS.length &&
    registry.components.length === HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS.length &&
    HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS.every((componentId, index) => {
      const component = registry.components[index];
      return component?.id === componentId && component.parityStatus === "story_documented";
    });

  const noCertifiedProgram =
    registry.certifiedTerminalProgram === false &&
    registry.implementationRef === HARDWARE_BUNDLE_STORY_P3_141_IMPLEMENTATION_REF;

  const valid = policyIdMatches && competitorMatches && componentsComplete && noCertifiedProgram;

  return {
    valid,
    policyIdMatches,
    competitorMatches,
    componentsComplete,
    noCertifiedProgram,
  };
}

export function checkHardwareBundleStoryLiveCertifiedGuideAudit(root = process.cwd()): boolean {
  const summary = auditCertifiedHardwareGuide(root);
  return summary.passed;
}
