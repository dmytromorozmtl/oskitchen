import type { Ga4ArmCheckoutRates } from "@/lib/storefront/ga4-data-api";
import {
  isGa4ApiCircuitOpen,
  recordGa4ApiFailure,
  recordGa4ApiSuccess,
} from "@/lib/storefront/ga4-api-guard";
import { fetchGa4ArmCheckoutRates, isGa4DataApiConfigured } from "@/lib/storefront/ga4-data-api";
import { readGa4ParityBqSnapshot, readGa4ParityCache, type Ga4ParityBqSnapshot } from "@/lib/storefront/ga4-parity-json";

export type Ga4ParityDataSource = "bq" | "data_api" | "cache" | "none";

export type ResolvedGa4ParityInput = {
  ga4: Ga4ArmCheckoutRates | null;
  bqSnapshot: Ga4ParityBqSnapshot | null;
  source: Ga4ParityDataSource;
  cachedAt: string | null;
  refreshed: boolean;
};

function bqMaxAgeMs(): number {
  const hours = Number(process.env.GA4_BQ_PRIMARY_MAX_AGE_HOURS ?? "36");
  return Math.max(1, hours) * 60 * 60 * 1000;
}

export function isBqParityPrimaryEnabled(): boolean {
  return process.env.GA4_BQ_PRIMARY !== "0";
}

/**
 * Resolve GA4 inputs for parity scoring.
 * BQ nightly snapshot is primary when fresh; Data API is fallback.
 */
export async function resolveGa4ParityInput(input: {
  themeExperimentJson: unknown;
  propertyId: string | null;
  days: number;
  force?: boolean;
}): Promise<ResolvedGa4ParityInput> {
  const propertyId = input.propertyId?.trim() || null;
  const cached = readGa4ParityCache(input.themeExperimentJson);
  const cacheFresh =
    cached && Date.now() - new Date(cached.at).getTime() < 15 * 60 * 1000 && !input.force;

  if (cacheFresh && cached) {
    return {
      ga4: cached.ga4,
      bqSnapshot: readGa4ParityBqSnapshot(input.themeExperimentJson),
      source: "cache",
      cachedAt: cached.at,
      refreshed: false,
    };
  }

  const bq = readGa4ParityBqSnapshot(input.themeExperimentJson);
  if (isBqParityPrimaryEnabled() && bq && Date.now() - new Date(bq.at).getTime() < bqMaxAgeMs()) {
    return {
      ga4: null,
      bqSnapshot: bq,
      source: "bq",
      cachedAt: bq.at,
      refreshed: false,
    };
  }

  if (!propertyId || !isGa4DataApiConfigured() || isGa4ApiCircuitOpen()) {
    return {
      ga4: null,
      bqSnapshot: bq,
      source: "none",
      cachedAt: cached?.at ?? bq?.at ?? null,
      refreshed: false,
    };
  }

  const fetched = await fetchGa4ArmCheckoutRates({ propertyId, days: input.days });
  if (fetched) {
    recordGa4ApiSuccess();
    return {
      ga4: fetched,
      bqSnapshot: bq,
      source: "data_api",
      cachedAt: new Date().toISOString(),
      refreshed: true,
    };
  }

  recordGa4ApiFailure();
  return {
    ga4: null,
    bqSnapshot: bq,
    source: "none",
    cachedAt: cached?.at ?? bq?.at ?? null,
    refreshed: false,
  };
}
