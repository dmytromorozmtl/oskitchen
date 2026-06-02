"use client";

import { useState, useTransition } from "react";

import { applyAiScheduleAction, generateAiScheduleAction } from "@/actions/labor/ai-scheduling";
import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import type { AiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  weekStartIso: string;
  canManage: boolean;
  initialPlan?: AiSchedulePlan | null;
};

export function AiSchedulePanel({ weekStartIso, canManage, initialPlan = null }: Props) {
  const [plan, setPlan] = useState<AiSchedulePlan | null>(initialPlan);
  const [targetLaborPct, setTargetLaborPct] = useState(initialPlan?.targetLaborPct ?? 28);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      setSuccessMessage(null);
      setApiError(null);
      const fd = new FormData();
      fd.set("weekStart", weekStartIso);
      fd.set("targetLaborPct", String(targetLaborPct));
      try {
        const next = await generateAiScheduleAction(fd);
        setPlan(next);
      } catch (err) {
        setApiError(err);
      }
    });
  }

  function handleApply() {
    if (!plan) return;
    const shifts = plan.days.flatMap((day) => day.shifts);
    startTransition(async () => {
      setSuccessMessage(null);
      setApiError(null);
      const fd = new FormData();
      fd.set("shiftsJson", JSON.stringify(shifts));
      try {
        const result = await applyAiScheduleAction(fd);
        setSuccessMessage(
          `Created ${result.created} shift${result.created === 1 ? "" : "s"}${result.skipped ? ` (${result.skipped} skipped)` : ""}.`,
        );
      } catch (err) {
        setApiError(err);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI schedule assistant</CardTitle>
          <p className="text-sm text-muted-foreground">
            Predicts staffing from recent orders, targets labor %, and drafts shift suggestions for the week of{" "}
            {weekStartIso}.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Target labor %</span>
              <input
                type="number"
                min={15}
                max={45}
                step={0.5}
                value={targetLaborPct}
                disabled={!canManage || isPending}
                onChange={(e) => setTargetLaborPct(Number(e.target.value))}
                className="w-28 rounded-md border px-2 py-1.5"
              />
            </label>
            {canManage && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleGenerate}
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
              >
                {isPending ? "Working…" : "Generate suggestions"}
              </button>
            )}
            {canManage && plan && plan.summary.totalShifts > 0 && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleApply}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Apply all to schedule
              </button>
            )}
          </div>
          {!canManage && (
            <p className="text-sm text-muted-foreground">
              View-only — <span className="font-medium text-foreground">schedule.manage</span> required to generate or apply.
            </p>
          )}
          {successMessage ? <p className="text-sm text-muted-foreground">{successMessage}</p> : null}
          {apiError ? (
            <AiFeatureApiError
              featureName="AI Scheduling"
              error={apiError}
              variant="inline"
              onRetry={handleGenerate}
              retryLabel="Try again"
            />
          ) : null}
        </CardContent>
      </Card>

      {plan && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Projected revenue</CardTitle>
                <p className="text-2xl font-semibold">${plan.summary.totalProjectedRevenue.toFixed(0)}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Projected labor</CardTitle>
                <p className="text-2xl font-semibold">${plan.summary.totalProjectedLabor.toFixed(0)}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Blended labor %</CardTitle>
                <p className="text-2xl font-semibold">{plan.summary.blendedLaborPct}%</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Confidence</CardTitle>
                <p className="text-2xl font-semibold capitalize">{plan.summary.confidence}</p>
              </CardHeader>
            </Card>
          </div>

          <ul className="space-y-1 text-sm text-muted-foreground">
            {plan.summary.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>

          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">Orders</th>
                  <th className="px-3 py-2">Revenue</th>
                  <th className="px-3 py-2">Headcount</th>
                  <th className="px-3 py-2">Labor %</th>
                  <th className="px-3 py-2">Shifts</th>
                </tr>
              </thead>
              <tbody>
                {plan.days.map((day) => (
                  <tr key={day.dateIso} className="border-t">
                    <td className="px-3 py-2 font-medium">
                      {day.dayLabel} {day.dateIso.slice(5)}
                    </td>
                    <td className="px-3 py-2">{day.predictedOrders.toFixed(0)}</td>
                    <td className="px-3 py-2">${day.predictedRevenue.toFixed(0)}</td>
                    <td className="px-3 py-2">{day.recommendedHeadcount}</td>
                    <td className="px-3 py-2">{day.projectedLaborPct}%</td>
                    <td className="px-3 py-2">
                      {day.shifts.length === 0 ? (
                        "—"
                      ) : (
                        <ul className="space-y-0.5">
                          {day.shifts.map((shift) => (
                            <li key={`${shift.staffMemberId}-${shift.startTime}`} className="text-xs text-muted-foreground">
                              {shift.staffName} · {shift.startTime}–{shift.endTime} · {shift.roleLabel}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
