import Link from "next/link";

import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { AiSchedulePanel } from "@/components/dashboard/staff/ai-schedule-panel";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { loadAiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import { weekStartMonday } from "@/services/labor/schedule-service";

export default async function AiSchedulingPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; labor?: string }>;
}) {
  const { week: weekParam, labor: laborParam } = await searchParams;
  const actor = await requireWorkspacePermissionActor();
  const canManageSchedule = hasPermission(actor.granted, "schedule.manage");

  const weekStart = weekParam ? new Date(weekParam) : weekStartMonday();
  weekStart.setHours(0, 0, 0, 0);
  const targetLaborPct = laborParam ? Number(laborParam) : 28;

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const initialPlan = await loadAiFeaturePage(() =>
    loadAiSchedulePlan(actor.userId, weekStart, targetLaborPct),
  );

  if (!initialPlan.ok) {
    return <AiFeatureApiError featureName="AI Scheduling" error={initialPlan.error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI scheduling</h1>
          <p className="text-sm text-muted-foreground">
            Demand-based staffing predictions and one-click draft schedules.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href={`?week=${prevWeek.toISOString().slice(0, 10)}`} className="rounded-md border px-2 py-1">
            ← Prev
          </Link>
          <Link href={`?week=${nextWeek.toISOString().slice(0, 10)}`} className="rounded-md border px-2 py-1">
            Next →
          </Link>
          <Link href="/dashboard/staff/schedule" className="rounded-md border px-2 py-1">
            Weekly board →
          </Link>
        </div>
      </div>

      <AiSchedulePanel
        weekStartIso={weekStart.toISOString().slice(0, 10)}
        canManage={canManageSchedule}
        initialPlan={initialPlan.data}
      />
    </div>
  );
}
