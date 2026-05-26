import type { ExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";

export type Ga4ParityChecklist = {
  days: number;
  firstParty: {
    publishedCheckoutRatePercent: number;
    draftCheckoutRatePercent: number;
    liftPp: number;
    recommendation: string;
  };
  ga4Steps: string[];
  parityNotes: string[];
};

/**
 * Manual GA4 parity workflow until BigQuery scheduled query is wired.
 * Compare same `days` window in Explore (experimentArm dimension) vs CSV export.
 */
export function buildGa4ParityChecklist(input: {
  days: number;
  decision: ExperimentProdDecision;
  ga4MeasurementId: string | null;
}): Ga4ParityChecklist {
  const ga4Steps = input.ga4MeasurementId
    ? [
        `Export KitchenOS CSV for ${input.days}d (Advanced → Download CSV).`,
        `GA4 Explore → same ${input.days}d date range → breakdown by experimentArm.`,
        `Compare draft vs published checkout→submit rate (first-party) with GA4 purchase/checkout events per arm.`,
        `Lift should align within ~2–3 pp if traffic and tagging are healthy (allow 24–48h CD lag).`,
      ]
    : [
        "Add GA4 measurement ID under Storefront → SEO.",
        "Register event-scoped custom dimension experimentArm (event parameter: experimentArm).",
        "Re-run parity after 24–48h.",
      ];

  const parityNotes: string[] = [
    `First-party (${input.days}d): published ${input.decision.publishedRate}% vs draft ${input.decision.draftRate}% checkout→submit (lift ${input.decision.liftPp > 0 ? "+" : ""}${input.decision.liftPp} pp).`,
    `Decision engine: ${input.decision.recommendation.replace(/_/g, " ")}.`,
  ];

  if (input.decision.recommendation === "publish_draft") {
    parityNotes.push(
      "Before Apply winner: confirm GA4 draft arm is not inflated by bot traffic (cross-check Traffic sanity card).",
    );
  }

  return {
    days: input.days,
    firstParty: {
      publishedCheckoutRatePercent: input.decision.publishedRate,
      draftCheckoutRatePercent: input.decision.draftRate,
      liftPp: input.decision.liftPp,
      recommendation: input.decision.recommendation,
    },
    ga4Steps,
    parityNotes,
  };
}

/** BigQuery scheduled query template (ops — run in GCP console). */
export function bigQueryExperimentParityQueryTemplate(input: {
  projectId: string;
  datasetId: string;
  days: number;
}): string {
  return `-- KitchenOS GA4 parity (experimentArm custom dimension)
-- Replace table suffix with your GA4 export date shard pattern.
SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'experimentArm') AS experiment_arm,
  COUNTIF(event_name IN ('purchase', 'checkout_submit')) AS conversions,
  COUNT(*) AS events
FROM \`${input.projectId}.${input.datasetId}.events_*\`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL ${input.days} DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
  AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'experimentArm') IN ('draft', 'published')
GROUP BY 1
ORDER BY 1;`;
}
