"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import type { DisputeResolutionDecision } from "@/lib/marketplace/dispute-types";
import {
  escalatePlatformDisputeToAdminReview,
  loadPlatformDisputeDetail,
  resolvePlatformDispute,
} from "@/services/marketplace/platform-dispute-resolution-service";

function revalidateDisputePaths() {
  revalidatePath("/platform/marketplace/disputes");
  revalidatePath("/dashboard/marketplace/orders");
  revalidatePath("/platform/marketplace/vendors");
}

export async function resolvePlatformDisputeAction(input: {
  disputeId: string;
  decision: DisputeResolutionDecision;
  notes: string;
  splitBuyerAmount?: number;
}) {
  const ctx = await requirePlatformAccess();
  if (!hasPlatformPermission(ctx.permissions, "platform:organizations:write")) {
    return { ok: false as const, error: "You do not have permission to resolve marketplace disputes." };
  }
  if (!input.notes.trim()) {
    return { ok: false as const, error: "Resolution notes are required." };
  }

  const result = await resolvePlatformDispute({
    disputeId: input.disputeId,
    decision: input.decision,
    notes: input.notes,
    splitBuyerAmount: input.splitBuyerAmount,
    reviewerUserId: ctx.userId,
    reviewerEmail: ctx.email,
  });

  if (result.ok) revalidateDisputePaths();
  return result;
}

export async function escalatePlatformDisputeAction(disputeId: string) {
  const ctx = await requirePlatformAccess();
  if (!hasPlatformPermission(ctx.permissions, "platform:organizations:write")) {
    return { ok: false as const, error: "You do not have permission to manage marketplace disputes." };
  }

  const result = await escalatePlatformDisputeToAdminReview(disputeId);
  if (result.ok) revalidateDisputePaths();
  return result;
}

export async function loadPlatformDisputeDetailAction(disputeId: string) {
  const ctx = await requirePlatformAccess();
  if (!hasPlatformPermission(ctx.permissions, "platform:organizations:read")) {
    return { ok: false as const, error: "Access denied." };
  }
  const detail = await loadPlatformDisputeDetail(disputeId);
  if (!detail) return { ok: false as const, error: "Dispute not found." };
  return { ok: true as const, detail };
}
