"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { recordLifecycleEventSafe } from "@/lib/lifecycle-events";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { UserRole } from "@prisma/client";

export async function appendCustomerSuccessNoteForm(
  formData: FormData,
): Promise<void> {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (profile?.role !== UserRole.OWNER) return;

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
    const { sessionUser: user } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (profile?.role !== UserRole.OWNER) return;

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
