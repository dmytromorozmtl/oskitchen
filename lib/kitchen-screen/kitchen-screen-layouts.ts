import type { BusinessType } from "@prisma/client";

import type { KitchenScreenMode } from "./kitchen-screen-types";

export function kitchenScreenHeading(bt: BusinessType | null | undefined): string {
  switch (bt) {
    case "RESTAURANT":
      return "Line Prep Screen";
    case "CAFE":
      return "Prep & Baking Screen";
    case "BAR":
      return "Bar Prep Screen";
    case "BAKERY":
      return "Batch Screen";
    case "CATERING":
      return "Event Production Screen";
    case "MEAL_PREP":
      return "Meal Prep Screen";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "Kitchen Command Screen";
    default:
      return "Kitchen Display";
  }
}

export function kitchenScreenEyebrow(bt: BusinessType | null | undefined): string {
  switch (bt) {
    case "BAR":
      return "Bar line";
    case "BAKERY":
      return "Production floor";
    case "MEAL_PREP":
      return "Meal prep line";
    default:
      return "Kitchen screen";
  }
}

export const KITCHEN_MODE_OPTIONS: { id: KitchenScreenMode; label: string }[] = [
  { id: "all", label: "All stations" },
  { id: "station", label: "Station" },
  { id: "my_tasks", label: "My tasks" },
  { id: "rush", label: "Rush" },
  { id: "packing", label: "Packing handoff" },
  { id: "event", label: "Event" },
  { id: "batch", label: "Batch" },
  { id: "bar_prep", label: "Bar prep" },
  { id: "bakery_batch", label: "Bakery batch" },
  { id: "meal_prep", label: "Meal prep" },
];
