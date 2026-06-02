"use server";

import { revalidatePath } from "next/cache";

import { getTenantActor } from "@/lib/scope/cached-tenant";
import { contributeData } from "@/services/ai/benchmark-network";

export async function contributeBenchmarkDataAction() {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    throw new Error("Workspace not found.");
  }

  const result = await contributeData(workspaceId);
  revalidatePath("/dashboard/analytics/benchmarks");
  return result;
}
