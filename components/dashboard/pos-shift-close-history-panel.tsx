import {
  classifyShiftVariance,
  formatShiftCloseoutMoney,
  formatShiftVarianceDisplay,
} from "@/lib/pos/pos-shift-closeout-preview";
import {
  formatShiftClosedAt,
  shiftVarianceBadgeClassName,
  shiftVarianceLabel,
  summarizeClosedShiftHistory,
} from "@/lib/pos/pos-shift-close-history-era18";
import type { ClosedShiftSummary } from "@/services/pos/pos-shift-service";
import { cn } from "@/lib/utils";

type PosShiftCloseHistoryPanelProps = {
  shifts: ClosedShiftSummary[];
};

export function PosShiftCloseHistoryPanel({ shifts }: PosShiftCloseHistoryPanelProps) {
  const summary = summarizeClosedShiftHistory(shifts);

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
    <div className="space-y-3" data-testid="pos-shift-close-history">
      <p className="text-xs text-muted-foreground">
        Last {summary.total} close{summary.total === 1 ? "" : "s"}
        {summary.withVariance > 0
          ? ` · ${summary.withVariance} with variance`
          : " · all balanced"}
      </p>
      <div className="overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Closed</th>
              <th className="px-3 py-2 font-medium">Register</th>
              <th className="px-3 py-2 font-medium text-right">Expected</th>
              <th className="px-3 py-2 font-medium text-right">Counted</th>
              <th className="px-3 py-2 font-medium">Variance</th>
              <th className="px-3 py-2 font-medium">Closed by</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => {
              const tone = classifyShiftVariance(shift.variance);
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
                className="text-xs text-muted-foreground"
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
