import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  buildDefaultAssignmentModelCard,
  isEuAiActPackEnabled,
  mergeEuAiActPack,
} from "@/lib/compliance/eu-ai-act";

export async function seedEuAiActPackForStorefronts(): Promise<{ seeded: number }> {
  if (!isEuAiActPackEnabled()) return { seeded: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let seeded = 0;
  for (const sf of storefronts) {
    const merged = mergeEuAiActPack(sf.themeExperimentJson, {
      at: new Date().toISOString(),
      modelCard: buildDefaultAssignmentModelCard(),
      oversightLog: [],
      transparencyUrl: process.env.EU_AI_ACT_TRANSPARENCY_URL ?? null,
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    seeded++;
  }

  return { seeded };
}
