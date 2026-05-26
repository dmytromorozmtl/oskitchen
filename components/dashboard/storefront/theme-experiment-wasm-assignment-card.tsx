import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isWasmAssignmentEnabled,
  readWasmAssignmentTelemetry,
  wasmAssignmentSloMicros,
} from "@/lib/storefront/theme-experiment-wasm-assignment";

export function ThemeExperimentWasmAssignmentCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const tel = readWasmAssignmentTelemetry(themeExperimentJson);
  const slo = wasmAssignmentSloMicros();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">WASM assignment kernel</CardTitle>
        <CardDescription>
          {isWasmAssignmentEnabled()
            ? "Sub-ms LinUCB at edge — Rust/WASM with TS fallback."
            : "Set THEME_EXPERIMENT_WASM_ASSIGNMENT=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {tel ? (
          <>
            <p className={tel.sloMet ? "text-emerald-700" : "text-amber-700"}>
              Last assign: {tel.lastDurationUs}µs ({tel.lastSource}) — SLO {slo}µs
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {tel.assignments} assignments · {tel.sloMet ? "SLO met" : "TS fallback triggered"}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">No WASM telemetry yet — traffic via middleware.</p>
        )}
      </CardContent>
    </Card>
  );
}
