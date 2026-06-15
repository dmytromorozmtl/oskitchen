import type { SOPCategory, SOPStatus } from "@prisma/client";

export const SOP_CATEGORY_LABEL: Record<SOPCategory, string> = {
  KITCHEN_PREP: "Kitchen prep",
  FOOD_SAFETY: "Food safety",
  ALLERGEN_HANDLING: "Allergen handling",
  PACKING: "Packing",
  DELIVERY: "Delivery",
  CUSTOMER_SERVICE: "Customer service",
  OPENING: "Opening procedures",
  CLOSING: "Closing procedures",
  CLEANING: "Cleaning",
  INVENTORY: "Inventory",
  EMERGENCIES: "Emergencies",
  CATERING: "Catering",
  CASH_HANDLING: "Cash handling",
  EQUIPMENT_MAINTENANCE: "Equipment maintenance",
  OTHER: "Other",
};

export const SOP_STATUS_LABEL: Record<SOPStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const SOP_STATUS_TONE: Record<SOPStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  DRAFT: "warning",
  ACTIVE: "success",
  ARCHIVED: "neutral",
};

/** Build a printable plain-text version of an SOP. */
export function renderSopAsText(input: { title: string; version: number; category: SOPCategory; content: string }): string {
  return [
    `${input.title}`,
    `Category: ${SOP_CATEGORY_LABEL[input.category]} · v${input.version}`,
    "",
    input.content,
  ].join("\n");
}
