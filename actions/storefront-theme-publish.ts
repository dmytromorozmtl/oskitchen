"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  loadPublishChecklistForStorefront,
  publishChecklistBlocksGoLive,
} from "@/lib/storefront/launch-readiness";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { canStorefront } from "@/lib/storefront/storefront-permissions";
import { getStorefrontPermissionSetForUser } from "@/services/storefront/storefront-permission-service";
import { publishStorefrontThemeSnapshot } from "@/services/storefront/storefront-theme-publish-service";

export async function publishStorefrontThemeFormAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:publish", { email })) {
      return { error: "You do not have permission to publish storefront theme changes." };
    }
    const confirm = (formData.get("confirmPublish") ?? "").toString();
    if (confirm !== "PUBLISH") {
      return { error: 'Type PUBLISH in the confirmation field to publish the live snapshot.' };
    }
    const publishAtRaw = (formData.get("themePublishAt") ?? "").toString().trim();
    const { sf, access } = await requireAdminStorefrontRow("storefront.theme", {
      id: true,
      storeSlug: true,
      userId: true,
    });
    if (!sf) return { error: "Storefront not configured." };

    const checklist = await loadPublishChecklistForStorefront(sf.id);
    const gate = publishChecklistBlocksGoLive(checklist);
    if (gate.blocked) {
      const labels = gate.failing.map((f) => f.label).join("; ");
      return {
        error: `Publish blocked — complete launch checklist first: ${labels}. Open Launch or Theme tab for details.`,
      };
    }

    if (publishAtRaw) {
      const at = new Date(publishAtRaw);
      if (Number.isNaN(at.getTime())) return { error: "Invalid schedule time." };
      if (at > new Date()) {
        await prisma.storefrontSettings.update({
          where: { id: sf.id },
          data: { themePublishAt: at },
        });
        revalidatePath("/dashboard/storefront/theme");
        return null;
      }
    }

    const r = await publishStorefrontThemeSnapshot({ userId, storefrontId: sf.id });
    if (!r.ok) return { error: r.error };
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themePublishAt: null },
    });
    revalidateStorefrontDashboardAndPublic(sf.storeSlug, "theme", {
      storefrontId: sf.id,
      ownerUserId: access.storefront.userId,
    });
    revalidatePath("/dashboard/storefront/theme");
    revalidatePath("/dashboard/storefront/launch");
    return null;
  } catch (e) {
    return { error: safeError(e) };
  }
}
