import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOI_PIPELINE_POLICY_ID,
  LOI_PIPELINE_REQUIRED_ICP_SEGMENTS,
  LOI_PIPELINE_SHORTLIST_SLOT_COUNT,
  LOI_PIPELINE_SHORTLIST_SLOTS,
  LOI_PIPELINE_STAGES,
  type LoiPipelineIcpSegment,
  type LoiPipelineStage,
} from "@/lib/pm/loi-pipeline-p3-126-policy";

export type LoiPipelineShortlistSlot = {
  id: string;
  segment: LoiPipelineIcpSegment;
  archetypeLabel: string;
  companyName: string | null;
  contactName: string | null;
  stage: LoiPipelineStage;
  icpScore: number | null;
  discoveryCallDate: string | null;
  loiSignedDate: string | null;
  notes: string;
};

export type LoiPipelineShortlist = {
  version: string;
  updatedAt: string;
  policyId: typeof LOI_PIPELINE_POLICY_ID;
  honestyNote: string;
  targetSignedLoiCount: number;
  slots: LoiPipelineShortlistSlot[];
};

export function loadLoiPipelineShortlist(
  root = process.cwd(),
  artifactPath = "artifacts/loi-pipeline-shortlist.json",
): LoiPipelineShortlist {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as LoiPipelineShortlist;
}

export function validateLoiPipelineShortlist(shortlist: LoiPipelineShortlist): {
  valid: boolean;
  slotCountCorrect: boolean;
  requiredSegmentsCovered: boolean;
  policyIdMatches: boolean;
  stagesValid: boolean;
  slotIdsMatch: boolean;
} {
  const slotCountCorrect = shortlist.slots.length === LOI_PIPELINE_SHORTLIST_SLOT_COUNT;
  const policyIdMatches = shortlist.policyId === LOI_PIPELINE_POLICY_ID;

  const segments = new Set(shortlist.slots.map((slot) => slot.segment));
  const requiredSegmentsCovered = LOI_PIPELINE_REQUIRED_ICP_SEGMENTS.every((segment) =>
    segments.has(segment),
  );

  const stagesValid = shortlist.slots.every((slot) =>
    LOI_PIPELINE_STAGES.includes(slot.stage),
  );

  const expectedIds = LOI_PIPELINE_SHORTLIST_SLOTS.map((slot) => slot.id);
  const slotIdsMatch =
    expectedIds.length === shortlist.slots.length &&
    expectedIds.every((id, index) => shortlist.slots[index]?.id === id);

  const valid =
    slotCountCorrect &&
    requiredSegmentsCovered &&
    policyIdMatches &&
    stagesValid &&
    slotIdsMatch;

  return {
    valid,
    slotCountCorrect,
    requiredSegmentsCovered,
    policyIdMatches,
    stagesValid,
    slotIdsMatch,
  };
}

export function countLoiPipelineSlotsByStage(
  shortlist: LoiPipelineShortlist,
): Record<LoiPipelineStage, number> {
  const counts = Object.fromEntries(
    LOI_PIPELINE_STAGES.map((stage) => [stage, 0]),
  ) as Record<LoiPipelineStage, number>;

  for (const slot of shortlist.slots) {
    counts[slot.stage] += 1;
  }

  return counts;
}
