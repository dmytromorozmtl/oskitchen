"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import {
  STOREFRONT_MEDIA_ALLOWED_MIME,
  validateStorefrontMediaUpload,
} from "@/lib/storefront/asset-validation";
import {
  deleteStorefrontMediaAsset,
  uploadStorefrontMediaAsset,
} from "@/services/storefront/storefront-media-upload-service";

const mediaUploadSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^<>:"/\\|?*]+$/, "Invalid filename"),
  mimeType: z.enum(STOREFRONT_MEDIA_ALLOWED_MIME),
  sizeBytes: z.number(),
  storefrontId: z.string().min(1),
  alt: z.string().max(500).optional(),
});

async function storefrontForUser(userId: string) {
  return prisma.storefrontSettings.findFirst({ where: { userId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: { id: true, storeSlug: true },
  });
}

export async function uploadStorefrontMediaFormAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const sf = await storefrontForUser(user.id);
    if (!sf) return { error: "Save the storefront overview once first." };

    const file = formData.get("file");
    if (!(file instanceof File)) return { error: "No file provided." };

    const bytes = new Uint8Array(await file.arrayBuffer());
    const validated = validateStorefrontMediaUpload({
      bytes,
      mimeType: file.type || "application/octet-stream",
    });
    if (!validated.ok) return { error: validated.error };
    const parsed = mediaUploadSchema.safeParse({
      filename: file.name,
      mimeType: validated.mimeType,
      sizeBytes: bytes.byteLength,
      storefrontId: sf.id,
      alt: formData.get("altText")?.toString(),
    });
    if (!parsed.success) return { error: "Invalid upload." };

    const result = await uploadStorefrontMediaAsset({
      userId,
      storefrontId: parsed.data.storefrontId,
      fileName: parsed.data.filename,
      contentType: parsed.data.mimeType,
      bytes,
      altText: parsed.data.alt,
      label: formData.get("label")?.toString(),
    });

    if (!result.ok) return { error: result.error };

    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/media");
    return { ok: true as const, url: result.url, assetId: result.assetId };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontMediaFormAction(formData: FormData): Promise<void> {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const assetId = (formData.get("assetId") ?? "").toString().trim();
    if (!/^[0-9a-f-]{36}$/i.test(assetId)) return;

    const result = await deleteStorefrontMediaAsset({ userId, assetId });
    if (!result.ok) return;

    const sf = await storefrontForUser(user.id);
    if (sf) {
      revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    }
    revalidatePath("/dashboard/storefront/media");
  } catch {
    /* form actions are fire-and-forget; errors surface on refresh */
  }
}
