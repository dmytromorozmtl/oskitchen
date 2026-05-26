import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isIso42001Stage2Enabled,
  mergeIso42001Stage2Pack,
  seedIso42001Stage2FromW4,
} from "@/lib/compliance/iso-42001-stage2";

export async function seedIso42001Stage2ForStorefronts(): Promise<{ seeded: number }> {
  if (!isIso42001Stage2Enabled()) return { seeded: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let seeded = 0;
  for (const sf of storefronts) {
    const pack = seedIso42001Stage2FromW4(sf.themeExperimentJson);
    const merged = mergeIso42001Stage2Pack(sf.themeExperimentJson, pack);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    seeded++;
  }

  return { seeded };
}
