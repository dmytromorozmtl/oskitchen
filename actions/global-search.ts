"use server";


import { requireGlobalSearchActor } from "@/lib/search/require-global-search-actor";
import type { GlobalSearchResponse } from "@/lib/search/search-types";
import { runGlobalSearchForUser } from "@/services/search/global-search-service";

export async function runGlobalSearch(query: string): Promise<GlobalSearchResponse> {
  const access = await requireGlobalSearchActor({ operation: "global_search.run" });
  if (!access.ok) {
    return { hits: [], truncated: false };
  }
  return runGlobalSearchForUser(access.dataUserId, query);
}
