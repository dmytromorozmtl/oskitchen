import type { ExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export type ExperimentSrmCheck = {
  totalExposures: number;
  configuredDraftPercent: number;
  observedDraftPercent: number;
  deltaPp: number;
  chiSquare: number;
  pValueApprox: number;
  warn: boolean;
  headline: string;
  detail: string;
};

/** Normal CDF approximation for chi-square df=1 p-value. */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/**
 * Sample ratio mismatch check: observed draft exposure share vs configured traffic %.
 * Warn when |delta| > 5 pp and total exposures ≥ 500.
 */
export function evaluateExperimentSrm(
  rows: ExperimentArmMetrics[],
  configuredDraftPercent: number,
): ExperimentSrmCheck {
  const published = rows.find((r) => r.arm === "published")?.exposures ?? 0;
  const draft = rows.find((r) => r.arm === "draft")?.exposures ?? 0;
  const total = published + draft;
  const configured = Math.min(100, Math.max(0, configuredDraftPercent));

  if (total === 0) {
    return {
      totalExposures: 0,
      configuredDraftPercent: configured,
      observedDraftPercent: 0,
      deltaPp: 0,
      chiSquare: 0,
      pValueApprox: 1,
      warn: false,
      headline: "No exposure data yet",
      detail: "SRM check runs after experiment.exposure events accumulate.",
    };
  }

  const observedDraftPercent = Math.round((draft / total) * 1000) / 10;
  const deltaPp = Math.round((observedDraftPercent - configured) * 10) / 10;
  const expectedDraft = (total * configured) / 100;
  const expectedPublished = total - expectedDraft;

  let chiSquare = 0;
  if (expectedDraft > 0) chiSquare += ((draft - expectedDraft) ** 2) / expectedDraft;
  if (expectedPublished > 0) chiSquare += ((published - expectedPublished) ** 2) / expectedPublished;

  const z = Math.sqrt(chiSquare);
  const pValueApprox = 2 * (1 - normalCdf(z));
  const warn = total >= 500 && Math.abs(deltaPp) > 5;

  return {
    totalExposures: total,
    configuredDraftPercent: configured,
    observedDraftPercent,
    deltaPp,
    chiSquare: Math.round(chiSquare * 100) / 100,
    pValueApprox: Math.round(pValueApprox * 1000) / 1000,
    warn,
    headline: warn
      ? `Traffic split drift: draft ${observedDraftPercent}% vs configured ${configured}%`
      : `Traffic split OK (draft ${observedDraftPercent}% vs ${configured}%)`,
    detail: warn
      ? `Difference ${deltaPp > 0 ? "+" : ""}${deltaPp} pp exceeds 5 pp threshold (n=${total}). Check edge assignment, bot traffic, or cookie loss. χ²≈${chiSquare.toFixed(2)}.`
      : `Observed draft share within 5 pp of config (n=${total}).`,
  };
}
