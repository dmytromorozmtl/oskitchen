import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isEo14110InventoryEnabled,
  mergeEo14110InventoryPack,
  seedEo14110FromEuUkPacks,
} from "@/lib/compliance/eo-14110-ai-inventory";

export async function seedEo14110InventoryForStorefronts(): Promise<{ seeded: number }> {
  if (!isEo14110InventoryEnabled()) return { seeded: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let seeded = 0;
  for (const sf of storefronts) {
    const pack = seedEo14110FromEuUkPacks(sf.themeExperimentJson);
    const merged = mergeEo14110InventoryPack(sf.themeExperimentJson, pack);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    seeded++;
  }

  return { seeded };
}
