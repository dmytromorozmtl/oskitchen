"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  assertPlatformPermission,
  requirePlatformAccess,
} from "@/lib/platform/platform-guards";
import {
  approvePartnerOAuthAppReview,
  rejectPartnerOAuthAppReview,
  suspendPartnerOAuthApp,
} from "@/services/platform/partner-app-review-service";

const approveSchema = z.object({
  registryId: z.string().uuid(),
  checklist: z.record(z.string(), z.boolean()),
  reviewNotes: z.string().optional(),
  publishAsSandbox: z.boolean().optional(),
});

const rejectSchema = z.object({
  registryId: z.string().uuid(),
  reviewNotes: z.string().min(8),
});

const suspendSchema = z.object({
  registryId: z.string().uuid(),
  reason: z.string().min(8),
});

export async function approvePartnerAppReviewAction(raw: z.infer<typeof approveSchema>) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:integrations:repair");

  const input = approveSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, error: "Invalid approval payload." };

  const result = await approvePartnerOAuthAppReview({
    registryId: input.data.registryId,
    reviewerUserId: ctx.userId,
    checklist: input.data.checklist,
    reviewNotes: input.data.reviewNotes,
    publishAsSandbox: input.data.publishAsSandbox ?? true,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/platform/partner-apps");
  revalidatePath("/dashboard/integrations/oauth-apps");
  revalidatePath("/dashboard/integrations/extensions");
  return { ok: true as const };
}

export async function rejectPartnerAppReviewAction(raw: z.infer<typeof rejectSchema>) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:integrations:repair");

  const input = rejectSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, error: "Rejection requires review notes (min 8 chars)." };

  const result = await rejectPartnerOAuthAppReview({
    registryId: input.data.registryId,
    reviewerUserId: ctx.userId,
    reviewNotes: input.data.reviewNotes,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/platform/partner-apps");
  return { ok: true as const };
}

export async function suspendPartnerAppReviewAction(raw: z.infer<typeof suspendSchema>) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:integrations:repair");

  const input = suspendSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, error: "Suspension requires a reason (min 8 chars)." };

  const result = await suspendPartnerOAuthApp({
    registryId: input.data.registryId,
    reviewerUserId: ctx.userId,
    reason: input.data.reason,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/platform/partner-apps");
  revalidatePath("/dashboard/integrations/oauth-apps");
  return { ok: true as const };
}
