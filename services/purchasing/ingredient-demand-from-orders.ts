/**
 * @deprecated Import from `@/lib/ingredient-demand/demand-calculation` for new code.
 * Kept so Purchasing and unit tests keep stable import paths.
 */
export type { OrderWithItems, RecipeWithLines, IngredientDemandRow } from "@/lib/ingredient-demand/types";
export { buildRowsLegacyOrderShape as buildIngredientDemandFromOrders } from "@/lib/ingredient-demand/demand-calculation";
