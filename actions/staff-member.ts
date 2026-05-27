"use server";

import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { logStaffPermissionDenied } from "@/services/staff/staff-permission-audit";

const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().max(64).optional(),
});

export async function createStaffMemberAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("staff.manage");
    if (!access.ok) {
      await logStaffPermissionDenied(access.actor, {
        requiredPermission: "staff.manage",
        operation: "staff.quick_create",
      });
      return { error: access.error };
    }
    const { userId } = access.actor;
    const parsed = schema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    });
    if (!parsed.success) return { error: "Name is required; email optional." };
    const d = parsed.data;
    const created = await prisma.staffMember.create({
      data: {
        userId,
        name: d.name.trim(),
        email: d.email?.trim() || null,
        role: d.role?.trim() || "staff",
      },
    });
    try {
      await prisma.staffEvent.create({
        data: {
          userId,
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
  const result = await createStaffMemberAction(formData);
  if ("error" in result && result.error) {
    throw new Error(result.error);
  }
}
