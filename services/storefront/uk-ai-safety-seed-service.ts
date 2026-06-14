import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isUkAiSafetyEnabled,
  mergeUkAiSafetyPack,
  seedUkAiSafetyFromEuPack,
} from "@/lib/compliance/uk-ai-safety";

export async function seedUkAiSafetyPackForStorefronts(): Promise<{ seeded: number }> {
  if (!isUkAiSafetyEnabled()) return { seeded: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let seeded = 0;
  for (const sf of storefronts) {
    const pack = seedUkAiSafetyFromEuPack(sf.themeExperimentJson);
    const merged = mergeUkAiSafetyPack(sf.themeExperimentJson, pack);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    seeded++;
  }

  return { seeded };
}
