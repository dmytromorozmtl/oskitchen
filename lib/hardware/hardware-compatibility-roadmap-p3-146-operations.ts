import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCertifiedHardwareGuide } from "@/lib/hardware/certified-hardware-guide-audit";
import { auditHardwareCompatibilityCenter } from "@/lib/hardware/hardware-compatibility-center-audit";
import { HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ITEMS } from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-content";
import {
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_COMPETITOR,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_IMPLEMENTATION_REF,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_SECONDARY_REF,
} from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-policy";

export type HardwareCompatibilityRoadmapItemRecord = {
  id: string;
  label: string;
  cloverTypical: string;
  osKitchenPath: string;
  phase: string;
};

export type HardwareCompatibilityRoadmapRegistry = {
  version: string;
  policyId: typeof HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  implementationRef: string;
  secondaryRef: string;
  fiservBundleRequired: boolean;
  roadmapItemCount: number;
  route: string;
  items: HardwareCompatibilityRoadmapItemRecord[];
};

export function loadHardwareCompatibilityRoadmapRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/hardware-compatibility-roadmap-registry.json",
): HardwareCompatibilityRoadmapRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as HardwareCompatibilityRoadmapRegistry;
}

export function validateHardwareCompatibilityRoadmapRegistry(
  registry: HardwareCompatibilityRoadmapRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  competitorMatches: boolean;
  itemsComplete: boolean;
  noFiservBundleRequired: boolean;
} {
  const policyIdMatches = registry.policyId === HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID;

  const competitorMatches = registry.competitor === HARDWARE_COMPATIBILITY_ROADMAP_P3_146_COMPETITOR;

  const itemsComplete =
    registry.roadmapItemCount === HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT &&
    registry.items.length === HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS.length &&
    HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS.every((itemId, index) => {
      const item = registry.items[index];
      const expected = HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ITEMS[index];
      return (
        item?.id === itemId &&
        item.label === expected?.label &&
        (item.phase === "shipped" || item.phase === "baseline")
      );
    });

  const noFiservBundleRequired =
    registry.fiservBundleRequired === false &&
    registry.implementationRef === HARDWARE_COMPATIBILITY_ROADMAP_P3_146_IMPLEMENTATION_REF &&
    registry.secondaryRef === HARDWARE_COMPATIBILITY_ROADMAP_P3_146_SECONDARY_REF;

  const valid = policyIdMatches && competitorMatches && itemsComplete && noFiservBundleRequired;

  return {
    valid,
    policyIdMatches,
    competitorMatches,
    itemsComplete,
    noFiservBundleRequired,
  };
}

export function checkHardwareCompatibilityRoadmapLiveCompatCenterAudit(
  root = process.cwd(),
): boolean {
  const summary = auditHardwareCompatibilityCenter(root);
  return summary.passed;
}

export function checkHardwareCompatibilityRoadmapLiveCertifiedGuideAudit(
  root = process.cwd(),
): boolean {
  const summary = auditCertifiedHardwareGuide(root);
  return summary.passed;
}
