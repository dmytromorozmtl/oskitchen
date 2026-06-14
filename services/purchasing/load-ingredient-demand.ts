import { loadDemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";

export async function loadIngredientDemandRows(userId: string) {
  const p = await loadDemandCommandCenterPayload(userId);
  return {
    rows: p.rows,
    ordersConsidered: p.ordersConsidered,
    recipesLinked: p.recipesLinked,
  };
}

export { loadDemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";
