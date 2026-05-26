import { Prisma, StorefrontPageType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  buildPublishedSectionSnapshots,
  mergePageLayoutMeta,
  parsePageLayoutMeta,
} from "@/lib/storefront/page-layout-snapshot";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

export async function publishStorefrontHomeLayout(input: {
  userId: string;
  storefrontId: string;
}): Promise<{ ok: true; publishedAt: string } | { ok: false; error: string }> {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: input.storefrontId, userId: input.userId },
    select: { id: true, storeSlug: true },
  });
  if (!sf) return { ok: false, error: "Storefront not found." };

  const homePage = await prisma.storefrontPage.findFirst({
    where: { storefrontId: sf.id, pageType: StorefrontPageType.HOME },
    include: { sections: { orderBy: { sortOrder: "asc" } } },
  });
  if (!homePage) return { ok: false, error: "Home page not found." };

  const publishedAt = new Date().toISOString();
  const snapshots = buildPublishedSectionSnapshots(homePage.sections);
  const existingMeta = parsePageLayoutMeta(homePage.contentJson);
  const contentJson = mergePageLayoutMeta(homePage.contentJson, {
    ...existingMeta,
    layoutPublishedAt: publishedAt,
    publishedSections: snapshots,
  });

  await prisma.storefrontPage.update({
    where: { id: homePage.id },
    data: {
      published: true,
      contentJson: contentJson as Prisma.InputJsonValue,
    },
  });

  revalidateStorefrontDashboardAndPublic(sf.storeSlug);
  return { ok: true, publishedAt };
}
