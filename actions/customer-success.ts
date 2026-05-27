"use server";


import { revalidatePath } from "next/cache";

import { authorizeGrowth } from "@/lib/growth/require-growth-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { recordLifecycleEventSafe } from "@/lib/lifecycle-events";
import { safeError } from "@/lib/security";

async function requireCustomerSuccessManageAccess() {
  return authorizeGrowth("growth.manage");
}

export async function appendCustomerSuccessNoteForm(
  formData: FormData,
): Promise<void> {
  try {
    const access = await requireCustomerSuccessManageAccess();
    if (!access.ok) return;

    const { sessionUser: user } = await requireTenantActor();
    const targetUserId = String(formData.get("targetUserId") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim();
    if (!targetUserId || !note) return;

    await recordLifecycleEventSafe(targetUserId, "cs_note", {
      text: note.slice(0, 4000),
      authorOwnerId: user.id,
    });
    revalidatePath("/dashboard/growth/customer-success");
  } catch (e) {
    void safeError(e);
  }
}

export async function markCustomerContactedForm(formData: FormData): Promise<void> {
  try {
    const access = await requireCustomerSuccessManageAccess();
    if (!access.ok) return;

    const { sessionUser: user } = await requireTenantActor();
    const targetUserId = String(formData.get("targetUserId") ?? "").trim();
    if (!targetUserId) return;

    await recordLifecycleEventSafe(targetUserId, "cs_contacted", {
      authorOwnerId: user.id,
    });
    revalidatePath("/dashboard/growth/customer-success");
  } catch (e) {
    void safeError(e);
  }
}
