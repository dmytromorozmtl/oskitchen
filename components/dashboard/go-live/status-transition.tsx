"use client";

import { useState, useTransition } from "react";

import { refreshValidationAction, transitionLaunchStatusAction } from "@/actions/go-live";
import { Button } from "@/components/ui/button";

export function StatusTransitionButtons({
  projectId,
  canApprove,
  canLaunch,
  canRollback,
  isSuper,
}: {
  projectId: string;
  canApprove: boolean;
  canLaunch: boolean;
  canRollback: boolean;
  isSuper: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [override, setOverride] = useState(false);

  function transition(target: string) {
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("target", target);
    formData.append("confirm", "true");
    if (override) formData.append("override", "true");
    startTransition(async () => {
      setError(null);
      try {
        await transitionLaunchStatusAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not change status.");
      }
    });
  }

  function refresh() {
    const formData = new FormData();
    formData.append("projectId", projectId);
    startTransition(async () => {
      setError(null);
      try {
        await refreshValidationAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not refresh.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={refresh} disabled={isPending}>
        {isPending ? "Working…" : "Run validation"}
      </Button>
      <Button size="sm" onClick={() => transition("APPROVED")} disabled={isPending || (!canApprove && !override)}>
        Mark approved
      </Button>
      <Button size="sm" onClick={() => transition("LIVE")} disabled={isPending || (!canLaunch && !override)}>
        Go live
      </Button>
      <Button size="sm" variant="destructive" onClick={() => transition("ROLLBACK_MODE")} disabled={isPending || !canRollback}>
        Trigger rollback
      </Button>
      {isSuper ? (
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <input type="checkbox" checked={override} onChange={(e) => setOverride(e.currentTarget.checked)} />
          Override blockers (super admin only)
        </label>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
