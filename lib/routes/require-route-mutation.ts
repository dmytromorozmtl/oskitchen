import { requireMutationPermission } from "@/lib/permissions/mutation-access";

export async function requireRouteMutation() {
  return requireMutationPermission("routes.manage");
}
