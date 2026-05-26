import type { ProductionWorkPriority } from "@prisma/client";

export const PRODUCTION_PRIORITY_LABEL: Record<ProductionWorkPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  CRITICAL: "Critical",
};

export function prioritySortScore(p: ProductionWorkPriority): number {
  switch (p) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 3;
    case "NORMAL":
      return 2;
    default:
      return 1;
  }
}
