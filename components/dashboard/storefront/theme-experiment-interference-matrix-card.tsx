import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateInterferencePublishGate,
  isInterferenceMatrixEnabled,
  readInterferenceMatrix,
} from "@/lib/storefront/theme-experiment-interference-matrix";

function heatColor(intensity: number): string {
  if (intensity >= 0.7) return "bg-red-500/80";
  if (intensity >= 0.4) return "bg-amber-500/70";
  return "bg-emerald-500/50";
}

export function ThemeExperimentInterferenceMatrixCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readInterferenceMatrix(themeExperimentJson);
  const gate = evaluateInterferencePublishGate(themeExperimentJson);

  const workspaces = snap ? [...new Set(snap.cells.map((c) => c.workspaceId))] : [];
  const stores = snap ? [...new Set(snap.cells.map((c) => c.storeSlug))] : [];

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Interference matrix</CardTitle>
        <CardDescription>
          {isInterferenceMatrixEnabled()
            ? "Synthetic control · workspace×store spillover heatmap · auto holdout bump."
            : "Set THEME_EXPERIMENT_INTERFERENCE_MATRIX=1."}
        </CardDescription>
      </CardHeader>
      {snap ? (
        <CardContent className="space-y-3 text-sm">
          <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
          <p className="text-muted-foreground">{gate.detail}</p>
          <p className="font-mono text-xs">
            synthetic {snap.syntheticControlLiftPp}pp · max {snap.maxInterferencePp}pp · bump +
            {snap.recommendedHoldoutBumpPercent}%
            {snap.autoHoldoutApplied ? " (applied)" : ""}
          </p>
          {workspaces.length > 0 && stores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] border-collapse text-[10px]">
                <thead>
                  <tr>
                    <th className="p-1 text-left text-muted-foreground">ws \ store</th>
                    {stores.map((s) => (
                      <th key={s} className="p-1 font-mono">
                        {s.slice(0, 8)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map((ws) => (
                    <tr key={ws}>
                      <td className="p-1 font-mono text-muted-foreground">{ws.slice(0, 8)}</td>
                      {stores.map((store) => {
                        const cell = snap.cells.find((c) => c.workspaceId === ws && c.storeSlug === store);
                        const intensity = cell ? Math.min(1, cell.spilloverPp / 5) : 0;
                        return (
                          <td key={store} className="p-1">
                            <div
                              className={`rounded px-1 py-0.5 text-center text-white ${heatColor(intensity)}`}
                              title={cell ? `${cell.spilloverPp}pp spillover` : "—"}
                            >
                              {cell ? cell.spilloverPp.toFixed(1) : "—"}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
