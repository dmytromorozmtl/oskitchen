/** Next.js cache tag for resolved tenant scope (owner userId + workspace). */
export function tenantActorCacheTag(sessionUserId: string): string {
  return `tenant-actor:${sessionUserId}`;
}
