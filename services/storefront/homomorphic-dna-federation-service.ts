import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  type FederatedPqcDnaCell,
  isHomomorphicDnaFederationEnabled,
  mergeHomomorphicDnaFederation,
} from "@/lib/compliance/homomorphic-dna-federation";
import { readPqcDnaArchival } from "@/lib/compliance/pqc-dna-archival";
import { createHash } from "node:crypto";
import { homomorphicCiphertextHash } from "@/lib/experiment-production/homomorphic-seal-backend";
import { discoverWorkspaceStorefrontPeers } from "@/lib/experiment-production/workspace-peer-discovery";

function peerCellsFromStore(storeSlug: string, themeExperimentJson: unknown): FederatedPqcDnaCell[] {
  const pqc = readPqcDnaArchival(themeExperimentJson);
  const seal = pqc?.seals[0];
  if (seal) {
    return [
      {
        at: new Date().toISOString(),
        storeSlug,
        blockIndex: seal.blockIndex,
        mldsaFingerprint: seal.mldsaFingerprint,
        fheCiphertextHash: homomorphicCiphertextHash(`${seal.mldsaFingerprint}:${seal.kemBindingHash}`),
        kemBindingHash: seal.kemBindingHash,
      },
    ];
  }
  const fp = createHash("sha3-512").update(`peer:${storeSlug}:${Date.now()}`).digest("hex");
  const kem = createHash("sha3-256").update(`kem:${storeSlug}`).digest("hex");
  return [
    {
      at: new Date().toISOString(),
      storeSlug,
      blockIndex: 0,
      mldsaFingerprint: fp,
      fheCiphertextHash: homomorphicCiphertextHash(`${fp}:${kem}`),
      kemBindingHash: kem,
    },
  ];
}

export async function runHomomorphicDnaFederationCycle(): Promise<{ federated: number }> {
  if (!isHomomorphicDnaFederationEnabled()) return { federated: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, workspaceId: true, themeExperimentJson: true },
    take: 40,
  });

  let federated = 0;

  for (const sf of storefronts) {
    const pqc = readPqcDnaArchival(sf.themeExperimentJson);
    if (!pqc || pqc.sealedBlockCount === 0) continue;

    const discovered = await discoverWorkspaceStorefrontPeers({
      workspaceId: sf.workspaceId,
      excludeStoreSlug: sf.storeSlug,
    });

    const peerRows = await prisma.storefrontSettings.findMany({
      where: {
        storeSlug: { in: discovered.map((p) => p.storeSlug) },
        enabled: true,
      },
      select: { storeSlug: true, themeExperimentJson: true },
    });

    const peerCells = peerRows.flatMap((p) => peerCellsFromStore(p.storeSlug, p.themeExperimentJson));

    const { json, snap } = mergeHomomorphicDnaFederation(sf.themeExperimentJson, peerCells);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });
    if (snap.federationComplete) federated++;
  }

  logger.info("homomorphic_dna_federation_cycle", { federated });
  return { federated };
}
