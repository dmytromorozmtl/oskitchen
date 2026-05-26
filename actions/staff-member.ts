"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().max(64).optional(),
});

export async function createStaffMemberAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = schema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    });
    if (!parsed.success) return { error: "Name is required; email optional." };
    const d = parsed.data;
    const created = await prisma.staffMember.create({
      data: {
        userId: dataUserId,
        name: d.name.trim(),
        email: d.email?.trim() || null,
        role: d.role?.trim() || "staff",
      },
    });
    try {
      await prisma.staffEvent.create({
        data: {
          userId: dataUserId,
          staffMemberId: created.id,
          eventType: "STAFF_CREATED",
          summary: `${created.name} added (quick form)`,
        },
      });
    } catch {
      // audit best-effort
    }
    revalidatePath("/dashboard/staff");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createStaffMemberFormAction(formData: FormData): Promise<void> {
  void (await createStaffMemberAction(formData));
}
