import Link from "next/link";

import { PosShiftCloseHistoryRangeFilter } from "@/components/dashboard/pos-shift-close-history-range-filter";
import { Button } from "@/components/ui/button";
import {
  classifyShiftVariance,
  formatShiftCloseoutMoney,
  formatShiftVarianceDisplay,
} from "@/lib/pos/pos-shift-closeout-preview";
import {
  buildShiftCloseHistoryExportHref,
  SHIFT_CLOSE_HISTORY_RANGE_LABEL,
  type ShiftCloseHistoryRangePreset,
} from "@/lib/pos/pos-shift-close-history-range-era18";
import {
  formatShiftClosedAt,
  shiftVarianceBadgeClassName,
  shiftVarianceLabel,
  summarizeClosedShiftHistory,
} from "@/lib/pos/pos-shift-close-history-era18";
import { resolvePosShiftCloseHistoryRowNextAction } from "@/lib/pos/pos-shift-close-focus-era18";
import type { ClosedShiftSummary } from "@/services/pos/pos-shift-service";
import { cn } from "@/lib/utils";

type PosShiftCloseHistoryPanelProps = {
  shifts: ClosedShiftSummary[];
  canExportCsv?: boolean;
  rangePreset: ShiftCloseHistoryRangePreset;
};

export function PosShiftCloseHistoryPanel({
  shifts,
  canExportCsv = false,
  rangePreset,
}: PosShiftCloseHistoryPanelProps) {
  const summary = summarizeClosedShiftHistory(shifts);
  const rangeLabel = SHIFT_CLOSE_HISTORY_RANGE_LABEL[rangePreset];
  const exportHref = buildShiftCloseHistoryExportHref(rangePreset);

  if (shifts.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-border/80 p-6 text-center text-sm text-muted-foreground"
        data-testid="pos-shift-close-history-empty"
      >
        <p className="font-medium text-foreground">No closed shifts yet</p>
        <p className="mt-1">Close a shift to see expected cash, counted cash, and variance here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="pos-shift-close-history" id="pos-shift-close-history">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PosShiftCloseHistoryRangeFilter />
        <p className="text-xs text-muted-foreground">
          {rangeLabel} · {summary.total} close{summary.total === 1 ? "" : "s"}
          {summary.withVariance > 0
            ? ` · ${summary.withVariance} with variance`
            : summary.total > 0
              ? " · all balanced"
              : ""}
        </p>
        {canExportCsv ? (
          <Button asChild variant="outline" size="sm" className="rounded-full h-8">
            <Link href={exportHref} data-testid="pos-shift-close-csv-export">
              Download CSV ({rangeLabel.toLowerCase()})
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Closed</th>
              <th className="px-3 py-2 font-medium">Register</th>
              <th className="px-3 py-2 font-medium text-right">Expected</th>
              <th className="px-3 py-2 font-medium text-right">Counted</th>
              <th className="px-3 py-2 font-medium">Variance</th>
              <th className="px-3 py-2 font-medium">Next action</th>
              <th className="px-3 py-2 font-medium">Closed by</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => {
              const tone = classifyShiftVariance(shift.variance);
              const nextAction = resolvePosShiftCloseHistoryRowNextAction({
                shiftId: shift.shiftId,
                variance: shift.variance,
                notes: shift.notes,
                registerName: shift.registerName,
              });
              return (
                <tr
                  key={shift.shiftId}
                  className="border-t border-border/60"
                  data-testid={`pos-shift-history-row-${shift.shiftId}`}
                >
                  <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">
                    {formatShiftClosedAt(shift.closedAtIso)}
                  </td>
                  <td className="px-3 py-2.5">{shift.registerName}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatShiftCloseoutMoney(shift.expectedCash)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatShiftCloseoutMoney(shift.closingCash)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        shiftVarianceBadgeClassName(tone),
                      )}
                    >
                      {formatShiftVarianceDisplay(shift.variance)}
                      {tone !== "balanced" && tone !== "pending" ? ` · ${shiftVarianceLabel(tone)}` : ""}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {nextAction ? (
                      <Link
                        href={nextAction.href}
                        className={
                          nextAction.tone === "urgent"
                            ? "text-sm font-medium text-destructive hover:underline"
                            : "text-sm text-amber-700 hover:underline dark:text-amber-400"
                        }
                        data-testid={`pos-shift-history-next-action-${shift.shiftId}`}
                      >
                        {nextAction.label}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {shift.closedByName ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {shifts.some((shift) => shift.notes) ? (
        <div className="space-y-2">
          {shifts
            .filter((shift) => shift.notes)
            .slice(0, 3)
            .map((shift) => (
              <p
                key={`${shift.shiftId}-note`}
                id={`pos-shift-history-note-${shift.shiftId}`}
                className="text-xs text-muted-foreground scroll-mt-24"
                data-testid={`pos-shift-history-note-${shift.shiftId}`}
              >
                <span className="font-medium text-foreground">{shift.registerName}</span> — {shift.notes}
              </p>
            ))}
        </div>
      ) : null}
    </div>
  );
}
