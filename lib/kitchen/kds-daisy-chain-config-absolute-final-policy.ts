/**
 * Absolute Final Task 93 — KDS daisy-chain config (NCR Aloha parity).
 *
 * Bump handoff links between KDS screens — when a ticket is bumped at station A,
 * the next screen in the chain receives it at station B.
 *
 * @see app/dashboard/kitchen/daisy-chain/page.tsx
 * @see components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx
 */

import { DEFAULT_KDS_STATIONS } from "@/lib/kitchen/kds-multi-station-policy";

export const KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID =
  "kds-daisy-chain-config-absolute-final-v1" as const;

export const KDS_DAISY_CHAIN_CONFIG_ROUTE = "/dashboard/kitchen/daisy-chain" as const;

export const KDS_DAISY_CHAIN_CONFIG_PAGE_PATH =
  "app/dashboard/kitchen/daisy-chain/page.tsx" as const;

export const KDS_DAISY_CHAIN_CONFIG_PANEL_PATH =
  "components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx" as const;

export const KDS_DAISY_CHAIN_CONFIG_SERVICE_PATH =
  "services/kitchen/kds-daisy-chain-config-service.ts" as const;

export const KDS_DAISY_CHAIN_CONFIG_STORAGE_KEY = "kdsDaisyChainConfig" as const;

export const KDS_DAISY_CHAIN_CONFIG_ALOHA_PARITY_PILLARS = [
  "bump_to_next_screen",
  "prep_to_line_to_expo",
  "toggle_per_link",
  "chain_preview",
  "settings_center_storage",
] as const;

export type KdsDaisyChainLink = {
  id: string;
  fromStationId: string;
  toStationId: string;
  label: string;
  enabled: boolean;
};

export type KdsDaisyChainConfig = {
  version: 1;
  links: KdsDaisyChainLink[];
};

const SPECIALTY_STATION_IDS = DEFAULT_KDS_STATIONS.filter(
  (s) => s.id !== "prep" && s.id !== "expo",
).map((s) => s.id);

export const DEFAULT_KDS_DAISY_CHAIN_LINKS: KdsDaisyChainLink[] = SPECIALTY_STATION_IDS.flatMap(
  (stationId) => {
    const station = DEFAULT_KDS_STATIONS.find((s) => s.id === stationId)!;
    return [
      {
        id: `prep-${stationId}`,
        fromStationId: "prep",
        toStationId: stationId,
        label: `Prep → ${station.name}`,
        enabled: true,
      },
      {
        id: `${stationId}-expo`,
        fromStationId: stationId,
        toStationId: "expo",
        label: `${station.name} → Expo`,
        enabled: true,
      },
    ];
  },
);

export const KDS_DAISY_CHAIN_CONFIG_CI_SCRIPTS = [
  "test:ci:kds-daisy-chain-config",
  "test:ci:kds-daisy-chain-config:cert",
] as const;

export const KDS_DAISY_CHAIN_CONFIG_UNIT_TEST =
  "tests/unit/kds-daisy-chain-config-absolute-final.test.ts" as const;

export const KDS_DAISY_CHAIN_CONFIG_WIRING_PATHS = [
  KDS_DAISY_CHAIN_CONFIG_PAGE_PATH,
  KDS_DAISY_CHAIN_CONFIG_PANEL_PATH,
  KDS_DAISY_CHAIN_CONFIG_SERVICE_PATH,
  "lib/kitchen/kds-daisy-chain-config-absolute-final-policy.ts",
  "lib/kitchen/kds-daisy-chain-config-storage.ts",
  "lib/kitchen/kds-daisy-chain-config-audit.ts",
  KDS_DAISY_CHAIN_CONFIG_UNIT_TEST,
  "actions/kitchen/daisy-chain.ts",
] as const;

export function mergeKdsDaisyChainLinks(
  custom: readonly KdsDaisyChainLink[] | null | undefined,
): KdsDaisyChainLink[] {
  if (!custom?.length) {
    return DEFAULT_KDS_DAISY_CHAIN_LINKS.map((link) => ({ ...link }));
  }

  const defaultsById = new Map(DEFAULT_KDS_DAISY_CHAIN_LINKS.map((link) => [link.id, link]));
  const merged = new Map<string, KdsDaisyChainLink>();

  for (const link of custom) {
    const base = defaultsById.get(link.id);
    merged.set(link.id, {
      ...(base ?? link),
      ...link,
    });
  }

  for (const link of DEFAULT_KDS_DAISY_CHAIN_LINKS) {
    if (!merged.has(link.id)) {
      merged.set(link.id, { ...link });
    }
  }

  return [...merged.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveDaisyChainNextStation(
  fromStationId: string,
  links: readonly KdsDaisyChainLink[],
  options?: { toStationId?: string },
): { toStationId: string; linkId: string } | null {
  const candidates = links.filter(
    (link) => link.enabled && link.fromStationId === fromStationId,
  );
  if (!candidates.length) return null;

  if (options?.toStationId) {
    const match = candidates.find((link) => link.toStationId === options.toStationId);
    if (!match) return null;
    return { toStationId: match.toStationId, linkId: match.id };
  }

  if (candidates.length === 1) {
    const only = candidates[0]!;
    return { toStationId: only.toStationId, linkId: only.id };
  }

  return null;
}

export function buildDaisyChainPaths(
  links: readonly KdsDaisyChainLink[],
  stationNameById: Readonly<Record<string, string>>,
): string[] {
  const enabled = links.filter((link) => link.enabled);
  const paths: string[] = [];

  for (const specialtyId of SPECIALTY_STATION_IDS) {
    const prepLink = enabled.find(
      (link) => link.fromStationId === "prep" && link.toStationId === specialtyId,
    );
    const expoLink = enabled.find(
      (link) => link.fromStationId === specialtyId && link.toStationId === "expo",
    );
    if (!prepLink && !expoLink) continue;

    const parts = ["Prep"];
    if (prepLink) {
      parts.push(stationNameById[specialtyId] ?? specialtyId);
    }
    if (expoLink) {
      parts.push("Expo");
    }
    paths.push(parts.join(" → "));
  }

  return paths.sort((a, b) => a.localeCompare(b));
}

export function parseKdsDaisyChainConfig(raw: unknown): KdsDaisyChainConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { version: 1, links: mergeKdsDaisyChainLinks(null) };
  }

  const record = raw as Record<string, unknown>;
  const linksRaw = Array.isArray(record.links) ? record.links : [];
  const links: KdsDaisyChainLink[] = [];

  for (const item of linksRaw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.fromStationId !== "string") continue;
    if (typeof row.toStationId !== "string") continue;
    links.push({
      id: row.id,
      fromStationId: row.fromStationId,
      toStationId: row.toStationId,
      label: typeof row.label === "string" ? row.label : `${row.fromStationId} → ${row.toStationId}`,
      enabled: row.enabled !== false,
    });
  }

  return { version: 1, links: mergeKdsDaisyChainLinks(links) };
}
