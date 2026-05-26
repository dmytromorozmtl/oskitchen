import type { BusinessType, ProductionWorkPriority, ProductionWorkStatus } from "@prisma/client";

/** URL / UI screen modes — execution filters, not Prisma enums. */
export type KitchenScreenMode =
  | "all"
  | "station"
  | "my_tasks"
  | "rush"
  | "packing"
  | "event"
  | "batch"
  | "bar_prep"
  | "bakery_batch"
  | "meal_prep";

export type KitchenCardSize = "large" | "compact";

export type KitchenWorkRowDTO = {
  id: string;
  title: string;
  quantity: number;
  station: string | null;
  stage: string | null;
  status: ProductionWorkStatus;
  priority: ProductionWorkPriority;
  sourceType: string;
  dueAt: string | null;
  startedAt: string | null;
  requiresPacking: boolean;
  requiresLabel: boolean;
  allergenWarning: string | null;
  notes: string | null;
  orderId: string | null;
  orderLabel: string | null;
  brandName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
};

export type KitchenLegacyRowDTO = {
  productId: string;
  productTitle: string;
  menuTitle: string;
  cooked: boolean;
  packed: boolean;
  labeled: boolean;
  preparedDate: string | null;
  pickupDate: string | null;
};

export type KitchenStaffOptionDTO = { id: string; name: string };

export type KitchenScreenBundleDTO = {
  workItems: KitchenWorkRowDTO[];
  legacyOpen: KitchenLegacyRowDTO[];
  staffMembers: KitchenStaffOptionDTO[];
  viewerStaffId: string | null;
  businessType: BusinessType | null;
  userRole: "OWNER" | "STAFF";
  platformBypass: boolean;
};

export type KitchenScreenQuery = {
  station: string | null;
  mode: KitchenScreenMode;
  fullscreen: boolean;
  cardSize: KitchenCardSize;
};
