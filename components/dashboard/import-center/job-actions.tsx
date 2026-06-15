"use client";

import { useState, useTransition } from "react";

import {
  cancelImportJobAction,
  commitImportJobAction,
  rollbackImportJobAction,
} from "@/actions/import-center";
import { Button } from "@/components/ui/button";

export function CommitJobButton({
  jobId,
  hasWarnings,
}: {
  jobId: string;
  hasWarnings: boolean;
}) {
  const [includeWarnings, setIncludeWarnings] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border p-4"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await commitImportJobAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Commit failed");
          }
        })
      }
    >
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="confirm" value="true" />
      <p className="text-sm font-medium">Commit preview rows</p>
      <p className="text-xs text-muted-foreground">
        Commit only valid rows. Error rows are never committed.
      </p>
      {hasWarnings ? (
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            name="includeWarnings"
            checked={includeWarnings}
            onChange={(e) => setIncludeWarnings(e.currentTarget.checked)}
          />
          Also commit warning rows
        </label>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Committing…" : "Commit valid rows"}
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </form>
  );
}

export function RollbackJobButton({
  jobId,
  recordsAvailable,
}: {
  jobId: string;
  recordsAvailable: number;
}) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border p-4"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await rollbackImportJobAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Rollback failed");
          }
        })
      }
    >
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="confirm" value="true" />
      <p className="text-sm font-medium">Rollback this import</p>
      <p className="text-xs text-muted-foreground">
        Removes the {recordsAvailable} records this import created (where it is safe to delete).
        Records referenced by downstream activity will be skipped and reported.
      </p>
      <textarea
        name="reason"
        required
        minLength={3}
        rows={2}
        placeholder="Reason for rollback (required)"
        value={reason}
        onChange={(e) => setReason(e.currentTarget.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      />
      <Button type="submit" variant="destructive" disabled={isPending || reason.length < 3}>
        {isPending ? "Rolling back…" : "Rollback import"}
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </form>
  );
}

export function CancelJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col gap-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await cancelImportJobAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Cancel failed");
          }
        })
      }
    >
      <input type="hidden" name="jobId" value={jobId} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Cancelling…" : "Cancel job"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
