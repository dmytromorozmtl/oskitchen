import { Badge } from "@/components/ui/badge";
import { READINESS_BAND_LABEL, type ReadinessSnapshot } from "@/lib/implementation/implementation-types";

export function ReadinessBadge({ snapshot }: { snapshot: ReadinessSnapshot | null }) {
  if (!snapshot) {
    return <Badge variant="outline">Not checked</Badge>;
  }
  const label = READINESS_BAND_LABEL[snapshot.band];
  const colorClass =
    snapshot.band === "ready"
      ? "bg-emerald-100 text-emerald-900 border-emerald-200"
      : snapshot.band === "needs_work"
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : "bg-rose-100 text-rose-900 border-rose-200";
  return (
    <Badge className={`border ${colorClass}`}>
      {snapshot.score}% · {label}
    </Badge>
  );
}
