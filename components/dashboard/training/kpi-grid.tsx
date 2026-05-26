import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { TrainingKpis } from "@/services/training/training-service";

function Tile({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "danger" | "warning" | "success" | "neutral" }) {
  const cls = tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : tone === "success" ? "text-emerald-600" : "";
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={`text-2xl tabular-nums ${cls}`}>{value}</CardTitle>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

export function TrainingKpiGrid({ tiles }: { tiles: TrainingKpis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Tile label="Active trainees" value={tiles.activeTrainees} />
      <Tile label="Average completion" value={`${tiles.averageCompletionPercent}%`} tone={tiles.averageCompletionPercent >= 80 ? "success" : tiles.averageCompletionPercent >= 50 ? "warning" : "danger"} />
      <Tile label="Certifications active" value={tiles.certificationsActive} tone={tiles.certificationsActive > 0 ? "success" : "neutral"} />
      <Tile label="Expiring soon" value={tiles.certificationsExpiringSoon} tone={tiles.certificationsExpiringSoon > 0 ? "warning" : "success"} hint="Within 30 days" />
      <Tile label="Failed quizzes" value={tiles.failedQuizzes} tone={tiles.failedQuizzes > 0 ? "warning" : "success"} />
      <Tile label="Simulations passed" value={tiles.simulationsCompleted} />
      <Tile label="Overdue assignments" value={tiles.overdueAssignments} tone={tiles.overdueAssignments > 0 ? "danger" : "success"} />
      <Tile label="Onboarding in flight" value={tiles.onboardingInFlight} />
      <Tile label="SOPs published" value={tiles.sopActive} />
      <Tile label="SOP acknowledgements pending" value={tiles.sopPendingAcks} tone={tiles.sopPendingAcks > 0 ? "warning" : "success"} />
      <Tile label="Programs" value={tiles.activePrograms} />
      <Tile label="Assignments" value={tiles.totalAssignments} />
    </div>
  );
}
