"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import {
  parseStorefrontStaffAccess,
  STOREFRONT_ADMIN_PERMISSIONS,
  type StorefrontAdminPermission,
} from "@/lib/storefront/storefront-admin-access";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { safeError } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";

const staffAccessFormSchema = z.object({
  allowWorkspaceStaff: z.coerce.boolean(),
  staffPermissions: z.array(z.enum(STOREFRONT_ADMIN_PERMISSIONS)).optional(),
});

export async function updateStorefrontStaffAccessAction(formData: FormData) {
  try {
    await requireTenantActor();
    const { sf: sf } = await requireAdminStorefrontRow("storefront.team", { id: true, storeSlug: true, workspaceId: true, userId: true });
    if (!sf) return { error: "Save storefront overview first." };

    const staffPerms = formData.getAll("staffPermissions").map(String) as StorefrontAdminPermission[];

    const parsed = staffAccessFormSchema.safeParse({
      allowWorkspaceStaff: formData.get("allowWorkspaceStaff") === "on",
      staffPermissions: staffPerms,
    });
    if (!parsed.success) return { error: "Invalid team settings." };

    const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId: sf.userId } });
    const center =
      kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object"
        ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
        : {};

    const storefrontBlock =
      center.storefront && typeof center.storefront === "object"
        ? { ...(center.storefront as Record<string, unknown>) }
        : {};

    storefrontBlock.staffAccess = {
      allowWorkspaceStaff: parsed.data.allowWorkspaceStaff,
      staffPermissions: parsed.data.staffPermissions ?? [],
      adminPermissions: [...STOREFRONT_ADMIN_PERMISSIONS],
    };
    center.storefront = storefrontBlock;

    await prisma.kitchenSettings.upsert({
      where: { userId: sf.userId },
      create: { userId: sf.userId, settingsCenterJson: toInputJsonValue(center) },
      update: { settingsCenterJson: toInputJsonValue(center) },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug, "settings", { storefrontId: sf.id });
    revalidatePath("/dashboard/storefront/team");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export const updateStorefrontStaffAccessFormAction = asVoidFormAction(updateStorefrontStaffAccessAction);
