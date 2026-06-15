"use client";

import {
  readBayesianPriorSnapshot,
  type BayesianPriorArm,
} from "@/lib/storefront/theme-experiment-bayesian-prior";
import type { BayesianArmPosterior } from "@/lib/storefront/theme-experiment-bayesian";

const W = 320;
const H = 120;
const PAD = 8;

function pathForFan(arms: { armId: string; low: number; mean: number; high: number }[]): string {
  if (arms.length === 0) return "";
  const step = (W - PAD * 2) / Math.max(1, arms.length - 1);
  const y = (rate: number) => H - PAD - rate * (H - PAD * 2);

  const upper = arms.map((a, i) => `${PAD + i * step},${y(a.high).toFixed(1)}`).join(" L ");
  const lower = [...arms]
    .reverse()
    .map((a, i) => {
      const idx = arms.length - 1 - i;
      return `${PAD + idx * step},${y(a.low).toFixed(1)}`;
    })
    .join(" L ");

  return `M ${upper} L ${lower} Z`;
}

function toFanArms(
  posteriors: BayesianArmPosterior[] | BayesianPriorArm[],
): { armId: string; low: number; mean: number; high: number }[] {
  return posteriors.map((p) => {
    if ("credibleIntervalLow" in p) {
      return {
        armId: p.armId,
        low: p.credibleIntervalLow,
        mean: p.meanRate,
        high: p.credibleIntervalHigh,
      };
    }
    return { armId: p.armId, low: p.ciLow, mean: p.meanRate, high: p.ciHigh };
  });
}

export function ThemeExperimentBayesianFanChart({
  posteriors,
  themeExperimentJson,
  sourceLabel,
}: {
  posteriors: BayesianArmPosterior[];
  themeExperimentJson?: unknown;
  sourceLabel?: string;
}) {
  const prior = readBayesianPriorSnapshot(themeExperimentJson);
  const arms = prior?.arms?.length ? toFanArms(prior.arms) : toFanArms(posteriors);
  if (arms.length < 2) return null;

  const d = pathForFan(arms);
  const label = sourceLabel ?? (prior ? `BQ ${prior.source} @ ${new Date(prior.at).toLocaleDateString()}` : "Live conjugate");

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Credible interval fan — {label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md text-primary" role="img" aria-label="Bayesian credible interval fan chart">
        <path d={d} fill="currentColor" fillOpacity={0.15} stroke="currentColor" strokeWidth={1} strokeOpacity={0.4} />
        {arms.map((a, i) => {
          const step = (W - PAD * 2) / Math.max(1, arms.length - 1);
          const x = PAD + i * step;
          const y = H - PAD - a.mean * (H - PAD * 2);
          return <circle key={a.armId} cx={x} cy={y} r={3} fill="currentColor" />;
        })}
      </svg>
      <ul className="flex flex-wrap gap-2 text-[10px] font-mono text-muted-foreground">
        {arms.map((a) => (
          <li key={a.armId}>
            {a.armId}: {(a.mean * 100).toFixed(1)}% [{ (a.low * 100).toFixed(1)}–{(a.high * 100).toFixed(1)}%]
          </li>
        ))}
      </ul>
    </div>
  );
}
