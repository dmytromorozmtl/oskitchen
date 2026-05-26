/**
 * Helpers for cross-tenant platform reads — always scope queries explicitly.
 * Never pass client-controlled workspace ids to mutations without permission checks.
 */
export type TenantScope = {
  /** When set, restrict listing to this workspace (future: partner-scoped admins). */
  workspaceId?: string;
};

export function assertUuid(id: string | undefined): id is string {
  return Boolean(id && /^[0-9a-f-]{36}$/i.test(id));
}
