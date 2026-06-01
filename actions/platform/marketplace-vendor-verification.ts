"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { reviewVendorRegistration } from "@/services/marketplace/vendor-registration-service";

export async function reviewMarketplaceVendorRegistrationAction(input: {
  vendorId: string;
  decision: "approve" | "reject" | "review";
  notes?: string | null;
}) {
  const ctx = await requirePlatformAccess();
  if (!hasPlatformPermission(ctx.permissions, "platform:organizations:write")) {
    return { ok: false as const, error: "You do not have permission to review vendor registrations." };
  }

  const result = await reviewVendorRegistration({
    vendorId: input.vendorId,
    decision: input.decision,
    reviewerUserId: ctx.userId,
    reviewerEmail: ctx.email,
    notes: input.notes,
  });

  if (result.ok) {
    revalidatePath("/platform/marketplace/vendor-verification");
    revalidatePath("/vendor/register/status");
  }

  return result;
}
