"use server";

import { revalidatePath } from "next/cache";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { safeError } from "@/lib/security";
import { createPartnerConnectAccountLink } from "@/services/platform/partner-stripe-connect-service";

export async function startPartnerStripeConnectAction(input: {
  publisherKey: string;
}): Promise<{ ok: true; url: string } | { error: string }> {
  try {
    const ctx = await requirePlatformAccess();
    assertPlatformPermission(ctx, "platform:billing:write");

    const publisherKey = input.publisherKey?.trim();
    if (!publisherKey) return { error: "Missing publisher key." };

    const result = await createPartnerConnectAccountLink({ publisherKey });
    if (!result.ok) return { error: result.error };

    revalidatePath("/platform/partner-billing");
    return { ok: true, url: result.url };
  } catch (e) {
    return { error: safeError(e) };
  }
}
