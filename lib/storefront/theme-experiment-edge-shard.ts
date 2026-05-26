/**
 * Per-workspace Edge Config shard (agency scale).
 * Set `EDGE_CONFIG_ID_<WORKSPACE_UUID>` (hyphens → underscores, uppercased).
 */
export function resolveEdgeConfigId(workspaceId?: string | null): string | null {
  const global = process.env.EDGE_CONFIG_ID?.trim();
  if (!workspaceId?.trim()) return global ?? null;

  const suffix = workspaceId.trim().replace(/-/g, "_").toUpperCase();
  const scoped = process.env[`EDGE_CONFIG_ID_${suffix}`]?.trim();
  return scoped || global || null;
}
