"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { safeError } from "@/lib/security";
import { canUseFeature } from "@/lib/plans/feature-registry";
import {
  generateBrandedPWA,
  publishBrandedPWA,
} from "@/services/branding/white-label-service";

export async function publishBrandedPwaAction(formData: FormData) {
  try {
    const { sessionUser, dataUserId } = await requireTenantActor();
    const gate = await canUseFeature(sessionUser.id, "white_label");
    if (!gate.allowed) {
      return fail("White-label PWA requires Pro or Enterprise plan.");
    }

    const themeColor = String(formData.get("themeColor") ?? "").trim();
    const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
    const hideKitchenOsBranding = String(formData.get("hideKitchenOsBranding") ?? "") === "on";

    const workspaceId = await ensureOwnerWorkspaceId(dataUserId);
    const result = await publishBrandedPWA({
      workspaceId,
      ownerUserId: dataUserId,
      logoUrl,
      themeColor,
      hideKitchenOsBranding,
    });

    if (!result.ok) return fail(result.error);

    revalidatePath("/dashboard/settings/branding");
    revalidatePath("/branding");
    revalidatePath(`/s/${result.config.storeSlug}`);
    revalidatePath(`/s/${result.config.storeSlug}/manifest.webmanifest`);

    return ok({
      message: "Branded PWA published — customers can install your app from the install page.",
      installUrl: result.config.installUrl,
      manifestUrl: result.config.manifestUrl,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function loadBrandedPwaPreviewAction() {
  try {
    const { dataUserId } = await requireTenantActor();
    const workspaceId = await ensureOwnerWorkspaceId(dataUserId);
    const config = await generateBrandedPWA(workspaceId);
    if (!config) {
      return fail("Set up your storefront before publishing a branded PWA.");
    }
    return ok({ config });
  } catch (e) {
    return fail(safeError(e));
  }
}
