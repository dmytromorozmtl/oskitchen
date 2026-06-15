"use client";

import { useState, useTransition } from "react";

import { updateChecklistItemAction } from "@/actions/go-live";
import { Button } from "@/components/ui/button";

const STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "NEEDS_REVIEW",
  "BLOCKED",
  "DONE",
  "WAIVED",
] as const;

export function ChecklistRow({
  projectId,
  itemId,
  initialStatus,
  initialAssignedToId,
  initialDueAt,
}: {
  projectId: string;
  itemId: string;
  initialStatus: string;
  initialAssignedToId?: string | null;
  initialDueAt?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [assigned, setAssigned] = useState(initialAssignedToId ?? "");
  const [dueAt, setDueAt] = useState(initialDueAt ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-center gap-2 text-xs"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await updateChecklistItemAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save.");
          }
        })
      }
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="itemId" value={itemId} />
      <select
        name="status"
        value={status}
        onChange={(e) => setStatus(e.currentTarget.value)}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
        ))}
      </select>
      <input
        type="text"
        name="assignedToId"
        placeholder="Assignee uuid"
        value={assigned}
        onChange={(e) => setAssigned(e.currentTarget.value)}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      />
      <input
        type="date"
        name="dueAt"
        value={dueAt}
        onChange={(e) => setDueAt(e.currentTarget.value)}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
      {error ? <span className="text-destructive">{error}</span> : null}
    </form>
  );
}
