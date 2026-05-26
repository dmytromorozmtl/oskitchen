export type PosKitchenRoute =
  | "NO_KITCHEN_REQUIRED"
  | "SEND_TO_KITCHEN"
  | "SEND_TO_PACKING"
  | "SEND_TO_PRODUCTION_LATER"
  | "READY_NOW"
  | "CUSTOM";

/** Maps catalog categories to operational routing hints for POS → production. */
export function posRoutingForProductCategory(category: string): PosKitchenRoute {
  if (category === "BEVERAGES" || category === "BAR") return "NO_KITCHEN_REQUIRED";
  if (category === "SIDES" || category === "BAKERY" || category === "SNACKS") return "READY_NOW";
  return "SEND_TO_KITCHEN";
}
