import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isNistAiRmfEnabled,
  mergeNistAiRmfPack,
  seedNistAiRmfFromCompliancePacks,
} from "@/lib/compliance/nist-ai-rmf";

export async function seedNistAiRmfForStorefronts(): Promise<{ seeded: number }> {
  if (!isNistAiRmfEnabled()) return { seeded: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let seeded = 0;
  for (const sf of storefronts) {
    const pack = seedNistAiRmfFromCompliancePacks(sf.themeExperimentJson);
    const merged = mergeNistAiRmfPack(sf.themeExperimentJson, pack);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    seeded++;
  }

  return { seeded };
}
