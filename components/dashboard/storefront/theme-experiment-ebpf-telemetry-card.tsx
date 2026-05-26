import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ebpfAssignmentSloUs,
  isEbpfTelemetryEnabled,
  readEbpfTelemetry,
} from "@/lib/storefront/theme-experiment-ebpf-telemetry";

export function ThemeExperimentEbpfTelemetryCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const tel = readEbpfTelemetry(themeExperimentJson);
  const slo = ebpfAssignmentSloUs();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">eBPF edge telemetry</CardTitle>
        <CardDescription>
          {isEbpfTelemetryEnabled()
            ? "Kernel-level assignment latency · adaptive CDN purge on arm drift."
            : "Set THEME_EXPERIMENT_EBPF_TELEMETRY=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {tel ? (
          <>
            <p className={tel.assignmentLatencyUsP99 <= slo ? "text-emerald-700" : "text-amber-700"}>
              Assign p99: {tel.assignmentLatencyUsP99}µs (SLO {slo}µs)
            </p>
            <p className={tel.driftDetected ? "text-amber-700" : "text-muted-foreground"}>
              Arm drift: {tel.driftDetected ? "detected — purge pending" : "none"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {tel.samples.length} samples · last purge {tel.lastPurgedAt?.slice(0, 16) ?? "—"}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Awaiting middleware eBPF samples.</p>
        )}
      </CardContent>
    </Card>
  );
}
