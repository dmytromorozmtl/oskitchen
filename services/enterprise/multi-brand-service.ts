import { buildEnterpriseMultiBrandDashboard } from "@/lib/enterprise/multi-brand-builders";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { getBrandsOverview } from "@/services/brand/brand-analytics";

export type {
  EnterpriseBrandAlert,
  EnterpriseBrandRank,
  EnterpriseMultiBrandDashboard,
} from "@/lib/enterprise/multi-brand-types";

export async function loadEnterpriseMultiBrandDashboard(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const brands = await getBrandsOverview(ownerUserId);

  return buildEnterpriseMultiBrandDashboard({
    workspaceId,
    brands,
  });
}

export async function loadEnterpriseMultiBrandDashboardForUser(userId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }
  return loadEnterpriseMultiBrandDashboard(workspaceId);
}
