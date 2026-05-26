"use client";

import { useMemo, useState, useTransition } from "react";

import { saveAvailabilityAction } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import { DAY_LABEL } from "@/lib/staff/staff-availability";

type Window = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  available: boolean;
};

export function AvailabilityEditor({
  staffMemberId,
  initial,
}: {
  staffMemberId: string;
  initial: Window[];
}) {
  const baseline = useMemo<Window[]>(() => {
    if (initial.length > 0) return initial;
    return Array.from({ length: 7 }).map((_, day) => ({
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      available: day >= 1 && day <= 5,
    }));
  }, [initial]);

  const [windows, setWindows] = useState<Window[]>(baseline);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(day: number, patch: Partial<Window>) {
    setWindows((prev) => {
      const exists = prev.find((p) => p.dayOfWeek === day);
      if (exists) {
        return prev.map((p) => (p.dayOfWeek === day ? { ...p, ...patch } : p));
      }
      return [
        ...prev,
        { dayOfWeek: day, startTime: "09:00", endTime: "17:00", available: true, ...patch },
      ];
    });
  }

  function submit() {
    const formData = new FormData();
    formData.append("staffMemberId", staffMemberId);
    formData.append("windowsJson", JSON.stringify(windows));
    startTransition(async () => {
      setError(null);
      setMessage(null);
      try {
        await saveAvailabilityAction(formData);
        setMessage("Saved.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save availability.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <ul className="grid gap-2 md:grid-cols-2">
        {Array.from({ length: 7 }).map((_, day) => {
          const w = windows.find((p) => p.dayOfWeek === day);
          return (
            <li key={day} className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <strong>{DAY_LABEL[day]}</strong>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={w?.available ?? false}
                    onChange={(e) => update(day, { available: e.currentTarget.checked })}
                  />
                  Available
                </label>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <input
                  type="time"
                  value={w?.startTime ?? "09:00"}
                  onChange={(e) => update(day, { startTime: e.currentTarget.value })}
                  className="rounded border bg-background px-2 py-1"
                />
                <span>to</span>
                <input
                  type="time"
                  value={w?.endTime ?? "17:00"}
                  onChange={(e) => update(day, { endTime: e.currentTarget.value })}
                  className="rounded border bg-background px-2 py-1"
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={submit} disabled={isPending}>
          {isPending ? "Saving…" : "Save availability"}
        </Button>
        {message ? <span className="text-xs text-emerald-700">{message}</span> : null}
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    </div>
  );
}
