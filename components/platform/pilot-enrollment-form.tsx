"use client";

import { useState, useTransition } from "react";

import {
  clearWorkspacePilotEnrollmentAction,
  setWorkspacePilotEnrollmentAction,
} from "@/actions/platform-pilot-enrollments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SetWorkspacePilotEnrollmentForm({
  pilotOptions,
}: {
  pilotOptions: Array<{ id: string; label: string }>;
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
            await setWorkspacePilotEnrollmentAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save pilot enrollment.");
          }
        })
      }
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Workspace ID</span>
        <Input name="workspaceId" placeholder="workspace uuid" required />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Pilot module</span>
        <select
          name="readinessId"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {pilotOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving..." : "Enroll workspace"}
        </Button>
      </div>
      {error ? <p className="md:col-span-3 text-xs text-destructive">{error}</p> : null}
    </form>
  );
}

export function ClearWorkspacePilotEnrollmentButton({
  workspaceId,
  readinessId,
}: {
  workspaceId: string;
  readinessId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          try {
            await clearWorkspacePilotEnrollmentAction(formData);
          } catch {
            /* noop */
          }
        })
      }
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="readinessId" value={readinessId} />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        Clear
      </Button>
    </form>
  );
}
