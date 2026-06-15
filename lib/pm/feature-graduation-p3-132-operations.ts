import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FEATURE_GRADUATION_FEATURE_IDS,
  FEATURE_GRADUATION_GATE_IDS,
  FEATURE_GRADUATION_GATES,
  FEATURE_GRADUATION_POLICY_ID,
} from "@/lib/pm/feature-graduation-p3-132-policy";

export type FeatureGraduationGateStatus =
  | "pending"
  | "pass"
  | "fail"
  | "not_applicable";

export type FeatureGraduationFeatureRecord = {
  id: string;
  label: string;
  stage: string;
  graduatedAt: string | null;
  gates: Record<string, FeatureGraduationGateStatus>;
};

export type FeatureGraduationRegistry = {
  version: string;
  policyId: typeof FEATURE_GRADUATION_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  graduatedCount: number;
  gates: Array<{ id: string; label: string; description: string }>;
  features: FeatureGraduationFeatureRecord[];
};

export function loadFeatureGraduationRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/feature-graduation-registry.json",
): FeatureGraduationRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as FeatureGraduationRegistry;
}

export function validateFeatureGraduationRegistry(registry: FeatureGraduationRegistry): {
  valid: boolean;
  policyIdMatches: boolean;
  gatesMatch: boolean;
  featuresComplete: boolean;
  zeroGraduated: boolean;
} {
  const policyIdMatches = registry.policyId === FEATURE_GRADUATION_POLICY_ID;

  const gatesMatch =
    registry.gates.length === FEATURE_GRADUATION_GATES.length &&
    FEATURE_GRADUATION_GATE_IDS.every(
      (gateId, index) => registry.gates[index]?.id === gateId,
    );

  const featuresComplete =
    registry.features.length === FEATURE_GRADUATION_FEATURE_IDS.length &&
    FEATURE_GRADUATION_FEATURE_IDS.every(
      (featureId, index) => registry.features[index]?.id === featureId,
    ) &&
    registry.features.every((feature) =>
      FEATURE_GRADUATION_GATE_IDS.every((gateId) => gateId in feature.gates),
    );

  const zeroGraduated =
    registry.graduatedCount === 0 &&
    registry.features.every(
      (feature) => feature.stage !== "graduated" && feature.graduatedAt === null,
    );

  const valid = policyIdMatches && gatesMatch && featuresComplete && zeroGraduated;

  return {
    valid,
    policyIdMatches,
    gatesMatch,
    featuresComplete,
    zeroGraduated,
  };
}

export function countFeatureGraduation(registry: FeatureGraduationRegistry): {
  featureCount: number;
  gateCount: number;
  pendingGateCount: number;
  graduatedCount: number;
} {
  const pendingGateCount = registry.features.reduce(
    (sum, feature) =>
      sum + Object.values(feature.gates).filter((status) => status === "pending").length,
    0,
  );

  return {
    featureCount: registry.features.length,
    gateCount: FEATURE_GRADUATION_GATE_IDS.length,
    pendingGateCount,
    graduatedCount: registry.graduatedCount,
  };
}
