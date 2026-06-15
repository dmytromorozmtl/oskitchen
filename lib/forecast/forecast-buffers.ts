import type { BusinessType } from "@prisma/client";

/**
 * Buffer rule resolution. Today buffers are a single `bufferPercent`
 * stored on the run, with per-business defaults. The data model is
 * already shaped so per-product / per-category rules can layer on top
 * later without breaking existing runs.
 */

export type BufferRuleScope = "global" | "category" | "product" | "high_risk" | "catering" | "bakery" | "bar";

export type BufferRule = {
  scope: BufferRuleScope;
  bufferPercent: number;
  note?: string;
};

export const DEFAULT_BUFFER_PERCENT = 10;

export function bufferDefaultForMode(mode: BusinessType | null | undefined): number {
  switch (mode) {
    case "BAKERY":
      return 12;
    case "BAR":
      return 8;
    case "CATERING":
      return 15;
    case "MEAL_PREP":
      return 10;
    case "RESTAURANT":
    case "CAFE":
      return 8;
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return 12;
    default:
      return DEFAULT_BUFFER_PERCENT;
  }
}

export function clampBufferPercent(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BUFFER_PERCENT;
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}
