"use server";


import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { dispatchStorefrontPagePublishedWebhook } from "@/lib/storefront/storefront-webhook";
import {
  getWebhookDeliveryEventForStorefront,
} from "@/services/storefront/webhook-delivery-log-service";

/** Settings admins: replay page.published webhook for a logged delivery row. */
export async function redeliverPagePublishWebhookFormAction(formData: FormData): Promise<void> {
  try {
    await requireTenantActor();
    const { sf } = await requireAdminStorefrontRow("storefront.settings", {
      id: true,
      storeSlug: true,
      pagePublishWebhookUrl: true,
      pagePublishWebhookSecret: true,
    });

    const eventId = String(formData.get("eventId") ?? "").trim();
    if (!eventId) return;

    const logRow = await getWebhookDeliveryEventForStorefront({
      storefrontId: sf.id,
      conversionEventId: eventId,
    });
    if (!logRow?.metadata) return;

    const webhookUrl = sf.pagePublishWebhookUrl?.trim();
    if (!webhookUrl?.startsWith("https://")) return;

    const page = await prisma.storefrontPage.findFirst({
      where: { id: logRow.metadata.pageId, storefrontId: sf.id },
      select: { id: true, slug: true, title: true, updatedAt: true },
    });
    if (!page) return;

    const publishedAt = logRow.metadata.publishedAt ?? page.updatedAt.toISOString();

    await dispatchStorefrontPagePublishedWebhook({
      storefrontId: sf.id,
      webhookUrl,
      webhookSecret: sf.pagePublishWebhookSecret,
      storeSlug: sf.storeSlug,
      pageId: page.id,
      pageSlug: page.slug,
      pageTitle: page.title,
      publishedAt,
    });

    revalidatePath("/dashboard/storefront/settings");
  } catch (e) {
    void safeError(e);
  }
}
