import { prisma } from "@/lib/prisma";

/** Promote pages whose publishAt has passed. Safe to call on public page loads. */
export async function promoteScheduledStorefrontPages(storefrontId: string): Promise<number> {
  const now = new Date();
  const due = await prisma.storefrontPage.findMany({
    where: {
      storefrontId,
      published: false,
      publishAt: { lte: now },
    },
    select: { id: true },
  });
  if (due.length === 0) return 0;
  await prisma.storefrontPage.updateMany({
    where: { id: { in: due.map((p) => p.id) } },
    data: { published: true },
  });
  return due.length;
}
