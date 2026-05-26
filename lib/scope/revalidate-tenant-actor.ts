import { revalidateTag } from "next/cache";

import { tenantActorCacheTag } from "@/lib/scope/tenant-cache-tags";

/** Invalidate cached tenant resolution after workspace membership or owner context changes. */
export function revalidateTenantActor(sessionUserId: string): void {
  revalidateTag(tenantActorCacheTag(sessionUserId));
}
