import type { BusinessType } from "@prisma/client";

export function nutritionLabelsPageTitle(businessType: BusinessType | null | undefined): string {
  switch (businessType) {
    case "BAKERY":
      return "Allergen & pickup labels";
    case "CATERING":
      return "Event allergen labels";
    case "RESTAURANT":
      return "Menu item allergen data";
    case "CAFE":
      return "Item allergens & labels";
    case "BAR":
      return "Beverage & event allergen notes";
    case "GHOST_KITCHEN":
      return "Order & item labels";
    case "MEAL_PREP":
    default:
      return "Nutrition & allergen labels";
  }
}
