"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { dispatchStorefrontPagePublishedWebhook } from "@/lib/storefront/storefront-webhook";
import {
  getWebhookDeliveryEventForStorefront,
} from "@/services/storefront/webhook-delivery-log-service";

async function requireStorefrontOwner(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (profile?.role !== "OWNER") {
    return { error: "Only the workspace owner can redeliver webhooks." as const };
  }
  const sf = await prisma.storefrontSettings.findFirst({ where: { userId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      storeSlug: true,
      pagePublishWebhookUrl: true,
      pagePublishWebhookSecret: true,
    },
  });
  if (!sf) return { error: "Storefront not configured." as const };
  return { sf };
}

/** Owner-only: replay page.published webhook for a logged delivery row. */
export async function redeliverPagePublishWebhookFormAction(formData: FormData): Promise<void> {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const owner = await requireStorefrontOwner(user.id);
    if ("error" in owner) return;

    const eventId = String(formData.get("eventId") ?? "").trim();
    if (!eventId) return;

    const logRow = await getWebhookDeliveryEventForStorefront({
      storefrontId: owner.sf.id,
      conversionEventId: eventId,
    });
    if (!logRow?.metadata) return;

    const webhookUrl = owner.sf.pagePublishWebhookUrl?.trim();
    if (!webhookUrl?.startsWith("https://")) return;

    const page = await prisma.storefrontPage.findFirst({
      where: { id: logRow.metadata.pageId, storefrontId: owner.sf.id },
      select: { id: true, slug: true, title: true, updatedAt: true },
    });
    if (!page) return;

    const publishedAt = logRow.metadata.publishedAt ?? page.updatedAt.toISOString();

    await dispatchStorefrontPagePublishedWebhook({
      storefrontId: owner.sf.id,
      webhookUrl,
      webhookSecret: owner.sf.pagePublishWebhookSecret,
      storeSlug: owner.sf.storeSlug,
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
