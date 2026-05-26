import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isEuAiOfficeNotifiedBodyEnabled,
  mergeEuAiOfficeNotifiedBodyPack,
  recordEuAiOfficeAssessment,
  seedEuAiOfficeFromCertBodyAndEuAct,
} from "@/lib/compliance/eu-ai-office-notified-body";

export async function seedEuAiOfficeConformityForStorefronts(): Promise<{ seeded: number }> {
  if (!isEuAiOfficeNotifiedBodyEnabled()) return { seeded: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let seeded = 0;
  for (const sf of storefronts) {
    const seed = seedEuAiOfficeFromCertBodyAndEuAct(sf.themeExperimentJson);
    const merged = mergeEuAiOfficeNotifiedBodyPack(sf.themeExperimentJson, seed);
    const latest = seed.assessments[seed.assessments.length - 1];
    if (latest) {
      const { json } = recordEuAiOfficeAssessment(merged, latest);
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: json as object },
      });
    } else {
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: merged as object },
      });
    }
    seeded++;
  }

  return { seeded };
}
