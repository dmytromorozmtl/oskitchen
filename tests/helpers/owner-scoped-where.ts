/** Default owner scope when workspace exists (includes legacy null workspace_id rows). */
export function legacyAwareOwnerScope(ownerUserId: string, workspaceId: string) {
  return {
    OR: [{ workspaceId }, { userId: ownerUserId, workspaceId: null }],
  };
}
