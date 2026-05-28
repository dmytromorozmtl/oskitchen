"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  SHIFT_CLOSE_HISTORY_RANGE_LABEL,
  SHIFT_CLOSE_HISTORY_RANGE_PRESETS,
  type ShiftCloseHistoryRangePreset,
  parseShiftCloseHistoryRangeParam,
} from "@/lib/pos/pos-shift-close-history-range-era18";

export function PosShiftCloseHistoryRangeFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = parseShiftCloseHistoryRangeParam(params.get("range"));

  function setRange(value: ShiftCloseHistoryRangePreset) {
    const url = new URLSearchParams(params.toString());
    url.set("range", value);
    startTransition(() => router.replace(`?${url.toString()}`));
  }

  return (
    <label
      className="flex items-center gap-2 text-xs text-muted-foreground"
      data-testid="pos-shift-close-history-range-filter"
    >
      Period
      <select
        className="rounded-full border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm"
        value={current}
        onChange={(event) => setRange(event.currentTarget.value as ShiftCloseHistoryRangePreset)}
        disabled={isPending}
        aria-label="Closed shift history period"
      >
        {SHIFT_CLOSE_HISTORY_RANGE_PRESETS.map((preset) => (
          <option key={preset} value={preset}>
            {SHIFT_CLOSE_HISTORY_RANGE_LABEL[preset]}
          </option>
        ))}
      </select>
    </label>
  );
}
