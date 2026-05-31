"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertPlatformPermission } from "@/lib/platform/platform-guards";
import { requirePlatformAccess } from "@/lib/platform/platform-guards";
import { safeError } from "@/lib/security";
import {
  generatePartnerBillingStatement,
  markPartnerBillingStatementPaid,
  syncActiveInstallBillingMeters,
} from "@/services/platform/partner-billing-service";

const statementSchema = z.object({
  publisherKey: z.string().min(1).max(120),
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/),
  finalize: z.coerce.boolean().optional(),
});

export async function syncPartnerBillingMetersAction() {
  try {
    const ctx = await requirePlatformAccess();
    assertPlatformPermission(ctx, "platform:billing:write");

    const result = await syncActiveInstallBillingMeters();
    revalidatePath("/platform/partner-billing");
    return { ok: true as const, ...result };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function generatePartnerBillingStatementAction(formData: FormData) {
  try {
    const ctx = await requirePlatformAccess();
    assertPlatformPermission(ctx, "platform:billing:write");

    const parsed = statementSchema.safeParse({
      publisherKey: formData.get("publisherKey"),
      periodMonth: formData.get("periodMonth"),
      finalize: formData.get("finalize") === "true",
    });
    if (!parsed.success) return { error: "Invalid statement parameters." };

    const statement = await generatePartnerBillingStatement({
      publisherKey: parsed.data.publisherKey,
      periodMonth: parsed.data.periodMonth,
      actorUserId: ctx.userId,
      finalize: parsed.data.finalize,
    });

    revalidatePath("/platform/partner-billing");
    return { ok: true as const, statementId: statement.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function markPartnerBillingStatementPaidAction(formData: FormData) {
  try {
    const ctx = await requirePlatformAccess();
    assertPlatformPermission(ctx, "platform:billing:write");

    const statementId = formData.get("statementId")?.toString().trim();
    if (!statementId) return { error: "Missing statement id." };

    const result = await markPartnerBillingStatementPaid({
      statementId,
      actorUserId: ctx.userId,
    });
    if (!result.ok) return { error: result.error };

    revalidatePath("/platform/partner-billing");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
