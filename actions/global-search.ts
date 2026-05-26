"use server";


import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import type { GlobalSearchResponse } from "@/lib/search/search-types";
import { runGlobalSearchForUser } from "@/services/search/global-search-service";

export async function runGlobalSearch(query: string): Promise<GlobalSearchResponse> {
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  return runGlobalSearchForUser(user.id, query);
}
