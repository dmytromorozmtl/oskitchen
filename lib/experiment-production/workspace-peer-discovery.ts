/**
 * Workspace-scoped storefront peer discovery for mesh / DNA federation (4.3).
 */

import { prisma } from "@/lib/prisma";
import { readWetwareCalibration } from "@/lib/storefront/theme-experiment-wetware-calibration";

export type DiscoveredStorefrontPeer = {
  storefrontId: string;
  storeSlug: string;
  synapses: { armId: string; weight: number; lastOutcome: "win" | "loss" | "neutral"; plasticity: number; updates: number }[];
};

export function isWorkspacePeerDiscoveryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_WORKSPACE_PEER_DISCOVERY !== "0";
}

function parseManualPeerSlugs(): string[] {
  const raw =
    process.env.CORTICAL_MESH_PEER_STORES?.trim() ||
    process.env.DNA_FEDERATION_PEER_STORES?.trim() ||
    "";
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Discover peer storefronts in the same workspace (enabled + not self).
 * Falls back to manual env list when workspaceId is null.
 */
export async function discoverWorkspaceStorefrontPeers(input: {
  workspaceId: string | null | undefined;
  excludeStoreSlug: string;
  limit?: number;
}): Promise<DiscoveredStorefrontPeer[]> {
  if (!isWorkspacePeerDiscoveryEnabled()) {
    return parseManualPeerSlugs()
      .filter((slug) => slug !== input.excludeStoreSlug)
      .map((storeSlug) => ({
        storefrontId: storeSlug,
        storeSlug,
        synapses: [
          { armId: "published", weight: 52, lastOutcome: "neutral" as const, plasticity: 1.1, updates: 10 },
          { armId: "draft", weight: 48, lastOutcome: "win" as const, plasticity: 1.2, updates: 12 },
        ],
      }));
  }

  const limit = input.limit ?? 20;

  if (input.workspaceId) {
    const peers = await prisma.storefrontSettings.findMany({
      where: {
        workspaceId: input.workspaceId,
        enabled: true,
        storeSlug: { not: input.excludeStoreSlug },
      },
      select: { id: true, storeSlug: true, themeExperimentJson: true },
      take: limit,
    });

    return peers.map((p) => {
      const cal = readWetwareCalibration(p.themeExperimentJson);
      const synapses =
        cal?.synapses?.map((s) => ({
          armId: s.armId,
          weight: s.weight,
          lastOutcome: s.lastOutcome,
          plasticity: s.plasticity,
          updates: s.updates,
        })) ?? [
          { armId: "published", weight: 50, lastOutcome: "neutral" as const, plasticity: 1, updates: 1 },
          { armId: "draft", weight: 50, lastOutcome: "neutral" as const, plasticity: 1, updates: 1 },
        ];
      return { storefrontId: p.id, storeSlug: p.storeSlug, synapses };
    });
  }

  const manual = parseManualPeerSlugs().filter((s) => s !== input.excludeStoreSlug);
  if (manual.length === 0) return [];

  const rows = await prisma.storefrontSettings.findMany({
    where: { storeSlug: { in: manual }, enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
  });

  return rows.map((p) => {
    const cal = readWetwareCalibration(p.themeExperimentJson);
    return {
      storefrontId: p.id,
      storeSlug: p.storeSlug,
      synapses:
        cal?.synapses?.map((s) => ({
          armId: s.armId,
          weight: s.weight,
          lastOutcome: s.lastOutcome,
          plasticity: s.plasticity,
          updates: s.updates,
        })) ?? [],
    };
  });
}
