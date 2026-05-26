/**
 * Canonical tenant "data owner" for user-scoped rows (KitchenSettings, Order, etc.).
 * Workspace members act on the workspace owner's `userId` column after access checks.
 */
export {
  resolveKitchenSettingsDataUserId as resolveTenantDataUserId,
  resolveKitchenSettingsDataUserIdForWorkspace as resolveTenantDataUserIdForWorkspace,
} from "@/lib/scope/resolve-kitchen-settings-owner";
