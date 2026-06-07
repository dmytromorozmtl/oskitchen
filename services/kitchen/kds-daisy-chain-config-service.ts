import {
  buildDaisyChainPaths,
  KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID,
  mergeKdsDaisyChainLinks,
  resolveDaisyChainNextStation,
  type KdsDaisyChainLink,
} from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";
import { DEFAULT_KDS_STATIONS } from "@/lib/kitchen/kds-multi-station-policy";
import { loadKdsDaisyChainLinks } from "@/lib/kitchen/kds-daisy-chain-config-storage";
import { loadKdsStationRegistry } from "@/services/kitchen/multi-station-service";

export type KdsDaisyChainConfigModel = {
  policyId: typeof KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID;
  links: KdsDaisyChainLink[];
  enabledLinkCount: number;
  chainPaths: string[];
  bumpPreview: Array<{ fromStation: string; nextStation: string; linkId: string }>;
};

export async function loadKdsDaisyChainConfigModel(userId: string): Promise<KdsDaisyChainConfigModel> {
  const [links, registry] = await Promise.all([
    loadKdsDaisyChainLinks(userId),
    loadKdsStationRegistry(userId),
  ]);

  const stationNameById = Object.fromEntries(registry.map((s) => [s.id, s.name]));

  const bumpPreview = links
    .filter((link) => link.enabled)
    .map((link) => ({
      fromStation: stationNameById[link.fromStationId] ?? link.fromStationId,
      nextStation: stationNameById[link.toStationId] ?? link.toStationId,
      linkId: link.id,
    }))
    .sort((a, b) => a.fromStation.localeCompare(b.fromStation));

  return {
    policyId: KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID,
    links,
    enabledLinkCount: links.filter((link) => link.enabled).length,
    chainPaths: buildDaisyChainPaths(links, stationNameById),
    bumpPreview,
  };
}

export async function resolveKdsDaisyChainNextStation(
  userId: string,
  fromStationId: string,
): Promise<{ toStationId: string; toStationName: string; linkId: string } | null> {
  const [links, registry] = await Promise.all([
    loadKdsDaisyChainLinks(userId),
    loadKdsStationRegistry(userId),
  ]);
  const next = resolveDaisyChainNextStation(fromStationId, links);
  if (!next) return null;
  const station = registry.find((s) => s.id === next.toStationId);
  return {
    toStationId: next.toStationId,
    toStationName: station?.name ?? next.toStationId,
    linkId: next.linkId,
  };
}

export { mergeKdsDaisyChainLinks, resolveDaisyChainNextStation };

export function defaultStationNameById(): Record<string, string> {
  return Object.fromEntries(DEFAULT_KDS_STATIONS.map((s) => [s.id, s.name]));
}
