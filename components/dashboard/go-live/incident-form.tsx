"use client";

import { useState, useTransition } from "react";

import { createIncidentAction, updateIncidentAction } from "@/actions/go-live";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SEVERITIES = ["INFO", "WARNING", "MAJOR", "CRITICAL"] as const;
const CATEGORIES = [
  "INTEGRATIONS", "KITCHEN", "PACKING", "ROUTES", "STAFFING",
  "PAYMENTS", "STOREFRONT", "ANALYTICS", "IMPORTS", "PERMISSIONS", "OTHER",
] as const;
const STATUSES = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export function IncidentForm({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-2 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await createIncidentAction(formData);
            (document.getElementById("incident-title") as HTMLInputElement | null)?.focus();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create incident.");
          }
        })
      }
    >
      <input type="hidden" name="projectId" value={projectId} />
      <Input id="incident-title" name="title" placeholder="Incident title" required />
      <select name="category" className="rounded-md border bg-background px-3 py-2 text-sm">
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select name="severity" defaultValue="MAJOR" className="rounded-md border bg-background px-3 py-2 text-sm">
        {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <textarea name="description" required placeholder="What happened? Impact?" className="min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm md:col-span-2" />
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Logging…" : "Log incident"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export function IncidentRowActions({
  projectId,
  incidentId,
  initialStatus,
}: {
  projectId: string;
  incidentId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [resolution, setResolution] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-center gap-2 text-xs"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await updateIncidentAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not update.");
          }
        })
      }
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="incidentId" value={incidentId} />
      <select
        name="status"
        value={status}
        onChange={(e) => setStatus(e.currentTarget.value)}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <input
        type="text"
        name="resolution"
        placeholder="Resolution (when resolving)"
        value={resolution}
        onChange={(e) => setResolution(e.currentTarget.value)}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Saving…" : "Update"}
      </Button>
      {error ? <span className="text-destructive">{error}</span> : null}
    </form>
  );
}
