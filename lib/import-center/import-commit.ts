import type { ImportType } from "@prisma/client";

import { COMMITTABLE_TYPES } from "@/lib/import-center/import-types";

export function isCommittableType(type: ImportType): boolean {
  return COMMITTABLE_TYPES.includes(type);
}

export function commitNotSupportedReason(type: ImportType): string {
  switch (type) {
    case "ORDERS":
      return "Orders import is preview-only; review staged orders before promoting them in the Orders module.";
    case "RECIPES":
      return "Recipe import is preview-only; commit in the Recipes module.";
    case "SUPPLIERS":
      return "Supplier import is preview-only; commit in the Purchasing module.";
    case "BRANDS":
      return "Brand import is preview-only; commit in the Brands module.";
    case "LOCATIONS":
      return "Location import is preview-only; commit in the Locations module.";
    case "NUTRITION_ALLERGENS":
      return "Nutrition import is preview-only; commit in the Nutrition module.";
    case "PRODUCT_MAPPINGS":
      return "Product-mapping import is preview-only; commit in the Product Mapping module.";
    case "MENU_ASSIGNMENTS":
      return "Menu-assignment import is preview-only; commit in the Menus module.";
    case "PURCHASE_ITEMS":
      return "Purchase-item import is preview-only; commit in the Purchasing module.";
    default:
      return "This import type is preview-only inside the Import Center.";
  }
}
