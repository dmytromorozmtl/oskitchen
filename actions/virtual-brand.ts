"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { VIRTUAL_BRAND_PATH, VIRTUAL_BRAND_TEMPLATES } from "@/lib/enterprise/virtual-brand-policy";
import { safeError } from "@/lib/errors";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { provisionVirtualBrand } from "@/services/enterprise/virtual-brand-service";

const provisionSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().max(120).optional(),
  templateKey: z.enum(VIRTUAL_BRAND_TEMPLATES),
  cloneFromMenuId: z.string().uuid().optional(),
  brandColor: z.string().max(32).optional(),
});

export async function provisionVirtualBrandQuick(
  formData: FormData,
): Promise<{ ok: true; brandId: string } | { error: string }> {
  try {
    const { userId, workspaceId } = await requireTenantActor();
    if (!workspaceId) return { error: "Workspace required to provision a virtual brand." };

    const cloneRaw = formData.get("cloneFromMenuId")?.toString().trim();
    const parsed = provisionSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug")?.toString().trim() || undefined,
      templateKey: formData.get("templateKey"),
      cloneFromMenuId: cloneRaw && cloneRaw.length > 0 ? cloneRaw : undefined,
      brandColor: formData.get("brandColor")?.toString().trim() || undefined,
    });
    if (!parsed.success) return { error: "Please check virtual brand fields." };

    const result = await provisionVirtualBrand({
      workspaceId,
      ownerUserId: userId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      templateKey: parsed.data.templateKey,
      cloneFromMenuId: parsed.data.cloneFromMenuId,
      brandColor: parsed.data.brandColor,
    });

    await recordAuditLog({
      workspaceId,
      userId,
      action: "virtual_brand.provisioned",
      entityType: "Brand",
      entityId: result.brandId,
      metadata: {
        slug: result.slug,
        templateKey: result.templateKey,
        menuId: result.menuId,
      },
    });

    revalidatePath(VIRTUAL_BRAND_PATH);
    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/enterprise/multi-brand");
    revalidatePath("/dashboard");

    return { ok: true as const, brandId: result.brandId };
  } catch (e) {
    return { error: safeError(e) };
  }
}
