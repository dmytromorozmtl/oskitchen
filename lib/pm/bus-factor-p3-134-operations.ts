import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BUS_FACTOR_P3_134_ADR_TARGET,
  BUS_FACTOR_P3_134_EMERGENCY_SYSTEM_IDS,
  BUS_FACTOR_P3_134_POLICY_ID,
  BUS_FACTOR_P3_134_VIDEO_TARGET,
} from "@/lib/pm/bus-factor-p3-134-policy";

export type BusFactorAdrVideoRecord = {
  adrId: string;
  title: string;
  status: string;
  recordedAt: string | null;
};

export type BusFactorP3_134Registry = {
  version: string;
  policyId: typeof BUS_FACTOR_P3_134_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  busFactor: number;
  targetBusFactorQ4: number;
  adrCount: number;
  adrVideoTarget: number;
  adrVideoRecorded: number;
  adrVideos: BusFactorAdrVideoRecord[];
  emergencyAccessArtifact: string;
  emergencySystemsPending: number;
  emergencySystemsVerified: number;
};

export type EmergencyAccessSystemRecord = {
  id: string;
  label: string;
  holderCount: number;
  accessStatus: string;
  lastVerifiedAt: string | null;
  note: string;
};

export type EmergencyAccessChecklist = {
  version: string;
  policyId: typeof BUS_FACTOR_P3_134_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  breakGlassRunbook: string;
  systems: EmergencyAccessSystemRecord[];
};

export function loadBusFactorP3_134Registry(
  root = process.cwd(),
  artifactPath = "artifacts/bus-factor-p3-134-registry.json",
): BusFactorP3_134Registry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as BusFactorP3_134Registry;
}

export function loadEmergencyAccessChecklist(
  root = process.cwd(),
  artifactPath = "artifacts/emergency-access-checklist.json",
): EmergencyAccessChecklist {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as EmergencyAccessChecklist;
}

export function validateBusFactorP3_134Registry(
  registry: BusFactorP3_134Registry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  adrCountMatches: boolean;
  videoSlotsComplete: boolean;
  zeroRecorded: boolean;
} {
  const policyIdMatches = registry.policyId === BUS_FACTOR_P3_134_POLICY_ID;

  const adrCountMatches =
    registry.adrCount === BUS_FACTOR_P3_134_ADR_TARGET &&
    registry.adrVideoTarget === BUS_FACTOR_P3_134_VIDEO_TARGET;

  const videoSlotsComplete =
    registry.adrVideos.length === BUS_FACTOR_P3_134_VIDEO_TARGET &&
    registry.adrVideos.every(
      (video, index) => video.adrId === String(index + 1).padStart(4, "0"),
    );

  const zeroRecorded =
    registry.adrVideoRecorded === 0 &&
    registry.adrVideos.every(
      (video) => video.status === "script_ready" && video.recordedAt === null,
    );

  const valid = policyIdMatches && adrCountMatches && videoSlotsComplete && zeroRecorded;

  return {
    valid,
    policyIdMatches,
    adrCountMatches,
    videoSlotsComplete,
    zeroRecorded,
  };
}

export function validateEmergencyAccessChecklist(
  checklist: EmergencyAccessChecklist,
): {
  valid: boolean;
  policyIdMatches: boolean;
  systemsComplete: boolean;
  allPending: boolean;
} {
  const policyIdMatches = checklist.policyId === BUS_FACTOR_P3_134_POLICY_ID;

  const systemsComplete =
    checklist.systems.length === BUS_FACTOR_P3_134_EMERGENCY_SYSTEM_IDS.length &&
    BUS_FACTOR_P3_134_EMERGENCY_SYSTEM_IDS.every(
      (systemId, index) => checklist.systems[index]?.id === systemId,
    );

  const allPending = checklist.systems.every(
    (system) => system.accessStatus === "pending" && system.lastVerifiedAt === null,
  );

  const valid = policyIdMatches && systemsComplete && allPending;

  return {
    valid,
    policyIdMatches,
    systemsComplete,
    allPending,
  };
}
