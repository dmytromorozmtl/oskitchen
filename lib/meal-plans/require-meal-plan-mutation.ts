import { requireMutationPermission } from "@/lib/permissions/mutation-access";

/** Meal plans generate orders — same gate as order mutations. */
export async function requireMealPlanMutation() {
  return requireMutationPermission("orders.manage");
}
