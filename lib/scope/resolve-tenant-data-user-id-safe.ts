import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";

/** Never throws {@link WorkspaceAccessDeniedError} — falls back to the session user id. */
export async function resolveTenantDataUserIdSafe(sessionUserId: string): Promise<string> {
  try {
    return await resolveTenantDataUserId(sessionUserId);
  } catch (error) {
    if (error instanceof WorkspaceAccessDeniedError) {
      console.error("[tenant] workspace access denied; using session user id", {
        sessionUserId,
      });
      return sessionUserId;
    }
    throw error;
  }
}
