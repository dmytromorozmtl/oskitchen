"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAccess, assertPlatformPermission } from "@/lib/platform/platform-guards";
import {
  finalizeCapitalPartnerBillingStatement,
  syncCapitalPartnerBillingStatements,
} from "@/services/commercial/capital-partner-billing-service";

export async function syncCapitalPartnerBillingStatementsAction(): Promise<
  { ok: true; upserted: number } | { error: string }
> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:billing:write");

  const result = await syncCapitalPartnerBillingStatements();
  revalidatePath("/platform/capital-partners");
  return { ok: true, upserted: result.upserted };
}

export async function finalizeCapitalPartnerBillingStatementAction(input: {
  statementId: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:billing:write");

  const result = await finalizeCapitalPartnerBillingStatement({
    statementId: input.statementId,
    actorUserId: ctx.userId,
  });
  if (!result.ok) return { error: result.error };
  revalidatePath("/platform/capital-partners");
  return { ok: true };
}
