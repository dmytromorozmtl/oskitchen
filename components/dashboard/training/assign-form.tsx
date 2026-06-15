"use client";

import { useState, useTransition } from "react";

import { assignProgramAction } from "@/actions/training";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AssignProgramForm({
  programId,
  staff,
}: {
  programId: string;
  staff: { id: string; name: string; email: string | null }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-2 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await assignProgramAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not assign.");
          }
        })
      }
    >
      <input type="hidden" name="programId" value={programId} />
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Assign to staff member</span>
        <select name="assignedToStaffId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">— select staff or fill name/email below —</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}{s.email ? ` (${s.email})` : ""}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Trainee name</span>
        <Input name="assignedToName" placeholder="Optional, free-form" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Trainee email</span>
        <Input name="assignedToEmail" type="email" placeholder="Optional" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Due date</span>
        <Input name="dueAt" type="date" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="practiceMode" value="true" defaultChecked />
        <span>Practice mode (no production data writes)</span>
      </label>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Assigning…" : "Assign"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
