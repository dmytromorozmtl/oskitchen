import type { Ga4ArmCheckoutRates } from "@/lib/storefront/ga4-data-api";
import type { Ga4ParityBqSnapshot } from "@/lib/storefront/ga4-parity-json";
import type { ExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import type { Ga4ParityDataSource } from "@/lib/storefront/ga4-parity-source";

export type { Ga4ArmCheckoutRates } from "@/lib/storefront/ga4-data-api";

export type Ga4ParityScore = {
  status: "ok" | "drift" | "unavailable" | "not_configured";
  parityScorePp: number | null;
  firstPartyLiftPp: number;
  ga4LiftPp: number | null;
  headline: string;
  detail: string;
  ga4: Ga4ArmCheckoutRates | null;
  cachedAt: string | null;
  dataSource?: Ga4ParityDataSource;
};

export function computeGa4ParityScore(input: {
  decision: ExperimentProdDecision;
  ga4: Ga4ArmCheckoutRates | null;
  propertyId: string | null;
  dataApiConfigured: boolean;
  cachedAt?: string | null;
  bqSnapshot?: Ga4ParityBqSnapshot | null;
  dataSource?: Ga4ParityDataSource;
}): Ga4ParityScore {
  if (input.bqSnapshot && input.dataSource === "bq") {
    const firstPartyLiftPp = input.decision.liftPp;
    const ga4LiftPp = input.bqSnapshot.ga4LiftPp;
    const parityScorePp = input.bqSnapshot.parityScorePp;
    const drift = parityScorePp > 3;
    return {
      status: drift ? "drift" : "ok",
      parityScorePp,
      firstPartyLiftPp,
      ga4LiftPp,
      headline: drift
        ? `Parity drift ${parityScorePp} pp (BQ primary)`
        : `Parity OK — Δ${parityScorePp} pp (BQ primary)`,
      detail: drift
        ? "BigQuery scheduled query reports drift vs first-party lift."
        : "BigQuery and first-party lifts are aligned within 3 pp.",
      ga4: null,
      cachedAt: input.bqSnapshot.at,
      dataSource: "bq",
    };
  }

  const firstPartyLiftPp = input.decision.liftPp;

  if (!input.propertyId) {
    return {
      status: "not_configured",
      parityScorePp: null,
      firstPartyLiftPp,
      ga4LiftPp: null,
      headline: "GA4 property ID missing",
      detail: "Add numeric GA4 Property ID under Storefront → SEO (not the G- measurement ID).",
      ga4: null,
      cachedAt: input.cachedAt ?? null,
    };
  }

  if (!input.dataApiConfigured) {
    return {
      status: "not_configured",
      parityScorePp: null,
      firstPartyLiftPp,
      ga4LiftPp: null,
      headline: "GA4 Data API not configured",
      detail: "Set GA4_SERVICE_ACCOUNT_JSON on the server (service account with Analytics read-only).",
      ga4: null,
      cachedAt: input.cachedAt ?? null,
    };
  }

  if (!input.ga4) {
    return {
      status: "unavailable",
      parityScorePp: null,
      firstPartyLiftPp,
      ga4LiftPp: null,
      headline: "GA4 report unavailable",
      detail:
        "Check property ID, custom dimension experimentArm, and that checkout_submit fires with experimentArm.",
      ga4: null,
      cachedAt: input.cachedAt ?? null,
    };
  }

  const ga4LiftPp =
    Math.round(
      (input.ga4.draftCheckoutRatePercent - input.ga4.publishedCheckoutRatePercent) * 10,
    ) / 10;
  const parityScorePp = Math.round(Math.abs(ga4LiftPp - firstPartyLiftPp) * 10) / 10;
  const drift = parityScorePp > 3;

  return {
    status: drift ? "drift" : "ok",
    parityScorePp,
    firstPartyLiftPp,
    ga4LiftPp,
    headline: drift
      ? `Parity drift ${parityScorePp} pp (OS Kitchen ${firstPartyLiftPp} pp vs GA4 ${ga4LiftPp} pp)`
      : `Parity OK — Δ${parityScorePp} pp vs GA4`,
    detail: drift
      ? "Investigate tagging lag, consent mode, or bot traffic before Apply winner."
      : "First-party and GA4 checkout rates are aligned within 3 pp.",
    ga4: input.ga4,
    cachedAt: input.cachedAt ?? null,
    dataSource: input.dataSource,
  };
}

export { readGa4ParityCache, readGa4ParityHistory, type Ga4ParityHistoryPoint } from "@/lib/storefront/ga4-parity-json";
