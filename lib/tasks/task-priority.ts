import type { KitchenTaskPriority } from "@prisma/client";

export const PRIORITY_BADGE_VARIANT: Record<KitchenTaskPriority, "default" | "secondary" | "outline" | "destructive"> = {
  CRITICAL: "destructive",
  URGENT: "destructive",
  HIGH: "default",
  NORMAL: "secondary",
  MEDIUM: "secondary",
  LOW: "outline",
};
