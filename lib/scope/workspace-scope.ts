/**
 * Workspace scoping helpers — Prisma queries must still include explicit `where` clauses.
 * These functions encode naming + intent for the ongoing userId → workspace migration.
 *
 * For **membership checks** (user may act inside a workspace), use
 * `lib/scope/assert-user-workspace-access.ts` (see `docs/TENANT_SCOPE_IDOR_PROGRAM_RU.md`).
 */
export type WorkspaceScope = { workspaceId: string };

export function assertWorkspaceId(value: string | null | undefined): asserts value is string {
  if (!value?.trim()) throw new Error("Workspace scope missing");
}
