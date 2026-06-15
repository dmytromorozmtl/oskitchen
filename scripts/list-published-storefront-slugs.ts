/**
 * List published storefront slugs (for smoke / E2E).
 *   npm run storefront:list-slugs
 */
import { prisma } from "@/lib/prisma";

async function main(): Promise<void> {
  const rows = await prisma.storefrontSettings.findMany({
    where: { enabled: true, published: true },
    select: { storeSlug: true, publicName: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  if (rows.length === 0) {
    console.log("No published storefronts found.");
    process.exitCode = 1;
    return;
  }
  console.log("Published storefronts:\n");
  for (const r of rows) {
    console.log(`  ${r.storeSlug}  (${r.publicName})`);
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
