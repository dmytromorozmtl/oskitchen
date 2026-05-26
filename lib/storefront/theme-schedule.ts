import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Promote theme draft → published when themePublishAt has passed. */
export async function promoteScheduledStorefrontTheme(storefrontId: string): Promise<boolean> {
  const now = new Date();
  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: storefrontId, themePublishAt: { lte: now } },
    select: { id: true, themeDraftJson: true, themePublishAt: true },
  });
  if (!sf?.themeDraftJson) return false;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      themePublishedJson: sf.themeDraftJson,
      themePublishedAt: now,
      themePublishAt: null,
    },
  });
  return true;
}

export async function promoteAllDueStorefrontThemes(): Promise<number> {
  const now = new Date();
  const due = await prisma.storefrontSettings.findMany({
    where: { themePublishAt: { lte: now }, themeDraftJson: { not: Prisma.DbNull } },
    select: { id: true },
    take: 20,
  });
  let count = 0;
  for (const row of due) {
    const ok = await promoteScheduledStorefrontTheme(row.id);
    if (ok) count++;
  }
  return count;
}
