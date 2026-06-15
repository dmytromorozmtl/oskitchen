"use client";

import { getActionError } from "@/lib/action-result";

import { useState, useTransition } from "react";

import { bulkAssignAction } from "@/actions/locations";

import type { LocationAssignmentTarget } from "@prisma/client";

export type AssignmentRow = {
  id: string;
  label: string;
  hint?: string;
};

export function AssignmentForm({
  target,
  rows,
  locations,
  title,
  description,
}: {
  target: LocationAssignmentTarget;
  rows: AssignmentRow[];
  locations: Array<{ id: string; name: string }>;
  title: string;
  description: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [locationId, setLocationId] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ assigned: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (selected.size === 0) {
      setError("Pick at least one row.");
      return;
    }
    const fd = new FormData();
    fd.set("target", target);
    fd.set("targetIds", Array.from(selected).join(","));
    fd.set("locationId", locationId);
    startTransition(async () => {
      const r = await bulkAssignAction(fd);
      if ("error" in r && r.error) setError(getActionError(r) ?? "Something went wrong");
      else if ("ok" in r && r.ok) {
        setResult({ assigned: r.assigned, skipped: r.skipped });
        setSelected(new Set());
      }
    });
  }

  return (
    <div className="rounded-xl border border-border/70 p-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing unassigned in this bucket.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-2">
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border/50 bg-muted/30 p-2">
            {rows.map((row) => (
              <label key={row.id} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={selected.has(row.id)}
                  onChange={() => toggle(row.id)}
                />
                <span className="flex-1">{row.label}</span>
                {row.hint ? <span className="text-muted-foreground">{row.hint}</span> : null}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">Clear location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={pending || selected.size === 0}
              className="h-9 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {pending ? "…" : `Assign (${selected.size})`}
            </button>
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {result ? (
            <p className="text-xs text-muted-foreground">
              Assigned {result.assigned} row{result.assigned === 1 ? "" : "s"}; skipped {result.skipped}.
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
