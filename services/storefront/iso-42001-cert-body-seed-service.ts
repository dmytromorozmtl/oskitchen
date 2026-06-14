import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isIso42001CertBodyEnabled,
  mergeIso42001CertBodyPack,
  recordCertBodyAttestation,
  seedCertBodyAttestationFromStage2,
} from "@/lib/compliance/iso-42001-cert-body";

export async function seedIso42001CertBodyForStorefronts(): Promise<{ seeded: number }> {
  if (!isIso42001CertBodyEnabled()) return { seeded: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let seeded = 0;
  for (const sf of storefronts) {
    const seed = seedCertBodyAttestationFromStage2(sf.themeExperimentJson);
    const merged = mergeIso42001CertBodyPack(sf.themeExperimentJson, seed);
    const latest = seed.attestations[seed.attestations.length - 1];
    if (latest) {
      const { json } = recordCertBodyAttestation(merged, latest);
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
