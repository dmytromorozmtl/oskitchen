/** Workspace vs organization rollup modes (UI + query builders). */
export type OrgScopeMode = "WORKSPACE" | "ORGANIZATION" | "ALL_WORKSPACES";

export type OrgScope = {
  mode: OrgScopeMode;
  organizationId: string | null;
  /** Primary workspace id when operating in single-workspace mode. */
  workspaceId: string | null;
};

export function workspaceOnlyScope(workspaceId: string): OrgScope {
  return { mode: "WORKSPACE", organizationId: null, workspaceId };
}

export function organizationScope(organizationId: string): OrgScope {
  return { mode: "ORGANIZATION", organizationId, workspaceId: null };
}
