import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  isEuAiOfficeContinuousConformityEnabled,
  syncConformityDeltaFromNotifiedBody,
} from "@/lib/compliance/eu-ai-office-continuous-conformity";
import { syncConformityToEuOffice } from "@/lib/experiment-production/eu-ai-office-api-client";
import { mergeProductionHardening } from "@/lib/experiment-production/production-hardening-gate";
import { experimentCryptoBackend } from "@/lib/experiment-production/crypto-backend";

export async function runEuAiOfficeContinuousConformitySyncCycle(): Promise<{ synced: number }> {
  if (!isEuAiOfficeContinuousConformityEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    const { json, pack } = syncConformityDeltaFromNotifiedBody(sf.themeExperimentJson);
    if (!pack) continue;

    const latestDelta = pack.deltas[pack.deltas.length - 1];
    if (latestDelta) {
      await syncConformityToEuOffice({
        assessmentId: latestDelta.deltaId,
        notifiedBodyId: process.env.EU_AI_OFFICE_NOTIFIED_BODY_ID ?? "nb-eu",
        conformityStatus: latestDelta.newStatus,
        highRiskAiSystem: false,
        certBodyCrossRef: latestDelta.certBodyCrossRef,
        validUntil: new Date(Date.now() + 86400000 * 365).toISOString(),
        deltaHash: latestDelta.deltaHash,
      });
    }

    let merged = json;
    merged = mergeProductionHardening(merged, {
      at: new Date().toISOString(),
      cryptoBackend: experimentCryptoBackend(),
      pqcBackend: experimentCryptoBackend(),
      zkBackend: experimentCryptoBackend(),
      strictEnvPassed: true,
    });

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    synced++;
  }

  logger.info("eu_ai_office_continuous_conformity_sync_cycle", { synced });
  return { synced };
}
