import { allEditorLocalesForStorefront } from "@/lib/storefront/localized-content";
import {
  buildStorefrontPublishChecklist,
  type PublishChecklistItem,
} from "@/lib/storefront/publish-checklist";
import { isStorefrontStrictLaunchEnabled, STRICT_PUBLISH_BLOCKER_IDS } from "@/lib/storefront/launch-strict";
import { prisma } from "@/lib/prisma";

/** Checklist items that must pass before go-live publish or theme publish. */
export const PUBLISH_BLOCKER_IDS = ["nav", "theme", "sections"] as const;

export function activePublishBlockerIds(): readonly string[] {
  return isStorefrontStrictLaunchEnabled() ? STRICT_PUBLISH_BLOCKER_IDS : PUBLISH_BLOCKER_IDS;
}

export type PublishBlockerId = (typeof PUBLISH_BLOCKER_IDS)[number];

export function publishChecklistBlocksGoLive(items: PublishChecklistItem[]): {
  blocked: boolean;
  failing: PublishChecklistItem[];
} {
  const blockerIds = activePublishBlockerIds();
  const failing = items.filter((i) => blockerIds.includes(i.id) && !i.ok);
  return { blocked: failing.length > 0, failing };
}

export async function loadPublishChecklistForStorefront(storefrontId: string): Promise<PublishChecklistItem[]> {
  const settings = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    include: {
      navigation: true,
      footer: true,
    },
  });
  if (!settings) return [];

  const pages = await prisma.storefrontPage.findMany({
    where: { storefrontId: settings.id },
    include: { sections: { select: { type: true, contentJson: true } } },
  });

  const productCount = settings.activeMenuId
    ? await prisma.product.count({
        where: {
          menuId: settings.activeMenuId,
          active: true,
          storefrontVisible: true,
        },
      })
    : 0;

  const editorLocales = allEditorLocalesForStorefront(settings.locale);
  return buildStorefrontPublishChecklist({
    storeSlug: settings.storeSlug,
    themePublishedAt: settings.themePublishedAt,
    navigationItemsJson: settings.navigation?.itemsJson ?? { items: [] },
    editorLocales,
    defaultLocale: editorLocales[0] ?? "en",
    activeMenuId: settings.activeMenuId,
    visibleProductCount: productCount,
    pickupEnabled: settings.pickupEnabled,
    deliveryEnabled: settings.deliveryEnabled,
    pages: pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      published: p.published,
      contentJson: p.contentJson,
      sections: p.sections,
    })),
  });
}
