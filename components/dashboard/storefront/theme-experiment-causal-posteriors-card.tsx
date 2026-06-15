"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildPartialRollbackPreviewDiff,
  isCausalPosteriorStreamEnabled,
  readCausalPosteriorStream,
  summarizeLatestPosterior,
} from "@/lib/storefront/theme-experiment-causal-posteriors";

export function ThemeExperimentCausalPosteriorsCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const stream = readCausalPosteriorStream(themeExperimentJson);
  const latest = stream ? summarizeLatestPosterior(stream) : null;
  const diff = buildPartialRollbackPreviewDiff(themeExperimentJson);

  const recent = stream?.points.slice(-24) ?? [];
  const maxMu = recent.length ? Math.max(...recent.map((p) => p.mu)) : 1;
  const minMu = recent.length ? Math.min(...recent.map((p) => p.mu)) : 0;
  const range = maxMu - minMu || 1;

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Live causal posteriors</CardTitle>
        <CardDescription>
          {isCausalPosteriorStreamEnabled()
            ? "PyMC streaming HDI — partial rollback preview diff."
            : "Set THEME_EXPERIMENT_CAUSAL_POSTERIORS=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {latest ? (
          <p className="text-muted-foreground">
            μ={latest.mu.toFixed(4)} · P(+)= {(latest.probPositive * 100).toFixed(1)}% · HDI [
            {latest.hdi[0].toFixed(3)}, {latest.hdi[1].toFixed(3)}]
          </p>
        ) : null}
        {recent.length > 0 ? (
          <div className="flex h-16 items-end gap-0.5 rounded-md border border-border/60 bg-muted/30 p-2">
            {recent.map((p, i) => (
              <div
                key={`${p.at}-${i}`}
                className="min-w-[3px] flex-1 rounded-t bg-primary/70"
                style={{ height: `${Math.max(8, ((p.mu - minMu) / range) * 100)}%` }}
                title={`${p.at}: μ=${p.mu}`}
              />
            ))}
          </div>
        ) : null}
        {diff ? (
          <div className="rounded-md border border-dashed border-border/80 p-3 text-xs">
            <p className="font-medium">Partial rollback preview</p>
            <p className="mt-1 text-muted-foreground">
              Layout revert: {diff.layoutChanged.join(", ") || "none"}
            </p>
            <p className="text-emerald-700">Kept from winner: {diff.copyKept.join(", ") || "—"}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
