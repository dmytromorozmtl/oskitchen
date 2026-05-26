"use client";

import { useState, useTransition } from "react";

import { createShiftAction, updateShiftStatusAction } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLE_TYPES = [
  ["", "Use staff role"],
  ["MANAGER", "Manager"], ["KITCHEN_LEAD", "Kitchen lead"], ["PREP_COOK", "Prep cook"],
  ["LINE_COOK", "Line cook"], ["PACKER", "Packer"], ["DRIVER", "Driver"],
  ["CUSTOMER_SERVICE", "Customer service"], ["CATERING_COORDINATOR", "Catering coordinator"],
  ["CUSTOM", "Custom"],
] as const;

export function CreateShiftForm({
  staff,
  locations,
}: {
  staff: { id: string; name: string; roleType: string }[];
  locations: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 md:grid-cols-3"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await createShiftAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create shift.");
          }
        })
      }
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Staff</span>
        <select name="staffMemberId" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">— select staff —</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Date</span>
        <Input name="shiftDate" type="date" required />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Location (optional)</span>
        <select name="locationId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">—</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Start</span>
        <Input name="startTime" type="time" required defaultValue="09:00" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">End</span>
        <Input name="endTime" type="time" required defaultValue="17:00" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Role (optional override)</span>
        <select name="role" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {ROLE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <div className="md:col-span-3 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Create shift"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export function ShiftStatusButtons({ shiftId, status }: { shiftId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  function transition(next: string) {
    const fd = new FormData();
    fd.append("shiftId", shiftId);
    fd.append("status", next);
    startTransition(async () => {
      try { await updateShiftStatusAction(fd); } catch { /* noop */ }
    });
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {status !== "CHECKED_IN" && status !== "COMPLETED" ? (
        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => transition("CHECKED_IN")}>
          Check in
        </Button>
      ) : null}
      {status !== "COMPLETED" ? (
        <Button type="button" size="sm" disabled={isPending} onClick={() => transition("COMPLETED")}>
          Complete
        </Button>
      ) : null}
      {status === "SCHEDULED" ? (
        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => transition("CANCELLED")}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}
