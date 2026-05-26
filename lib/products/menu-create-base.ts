import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

/** Required owner + workspace columns for Menu.create after NOT NULL migration. */
export async function menuCreateBaseForOwner(
  ownerUserId: string,
): Promise<{ userId: string; workspaceId: string }> {
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  if (!workspaceId) {
    throw new Error(
      `menuCreateBaseForOwner: no workspace for owner ${ownerUserId}. Provision workspace before creating menus.`,
    );
  }
  return { userId: ownerUserId, workspaceId };
}
