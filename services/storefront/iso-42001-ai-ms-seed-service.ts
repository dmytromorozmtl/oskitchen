import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isIso42001AiMsEnabled,
  mergeIso42001AiMsPack,
  seedIso42001FromRmfAndEu,
} from "@/lib/compliance/iso-42001-ai-ms";

export async function seedIso42001AiMsForStorefronts(): Promise<{ seeded: number }> {
  if (!isIso42001AiMsEnabled()) return { seeded: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let seeded = 0;
  for (const sf of storefronts) {
    const pack = seedIso42001FromRmfAndEu(sf.themeExperimentJson);
    const merged = mergeIso42001AiMsPack(sf.themeExperimentJson, pack);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    seeded++;
  }

  return { seeded };
}
