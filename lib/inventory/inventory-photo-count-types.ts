/**
 * P2-63 — Inventory AI photo count: shelf photo → AI counts inventory (MarketMan parity).
 *
 * @see docs/inventory-ai-photo-count-p2-63.md
 */

export type ShelfItemDetection = {
  label: string;
  quantity: number;
  confidence: number;
};

export type ShelfPhotoCountResult = {
  detections: ShelfItemDetection[];
  shelfLabel: string | null;
  confidence: number;
  policyId: string;
};

export type MatchedShelfCountLine = {
  ingredientName: string;
  ingredientId: string | null;
  detectedLabel: string;
  quantity: number;
  confidence: number;
};

export const INVENTORY_PHOTO_COUNT_POLICY_ID = "inventory-ai-photo-count-p2-63-v1" as const;

export const INVENTORY_PHOTO_COUNT_NOTES_MARKER = "Photo count (P2-63)" as const;
