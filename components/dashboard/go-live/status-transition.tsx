"use client";

import { useState, useTransition } from "react";

import { refreshValidationAction, transitionLaunchStatusAction } from "@/actions/go-live";
import { Button } from "@/components/ui/button";

export function StatusTransitionButtons({
  projectId,
  canRunValidation,
  canUseApprove,
  canUseLaunch,
  canUseRollback,
  canUnlock,
  readyToApprove,
  readyToLaunch,
  canRollbackStatus,
}: {
  projectId: string;
  canRunValidation: boolean;
  canUseApprove: boolean;
  canUseLaunch: boolean;
  canUseRollback: boolean;
  canUnlock: boolean;
  readyToApprove: boolean;
  readyToLaunch: boolean;
  canRollbackStatus: boolean;
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

  if (!canRunValidation && !canUseApprove && !canUseLaunch && !canUseRollback) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canRunValidation ? (
        <Button size="sm" variant="outline" onClick={refresh} disabled={isPending}>
          {isPending ? "Working…" : "Run validation"}
        </Button>
      ) : null}
      {canUseApprove ? (
        <Button
          size="sm"
          onClick={() => transition("APPROVED")}
          disabled={isPending || (!readyToApprove && !override)}
        >
          Mark approved
        </Button>
      ) : null}
      {canUseLaunch ? (
        <Button
          size="sm"
          onClick={() => transition("LIVE")}
          disabled={isPending || (!readyToLaunch && !override)}
        >
          Go live
        </Button>
      ) : null}
      {canUseRollback ? (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => transition("ROLLBACK_MODE")}
          disabled={isPending || !canRollbackStatus}
        >
          Trigger rollback
        </Button>
      ) : null}
      {canUnlock ? (
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <input type="checkbox" checked={override} onChange={(e) => setOverride(e.currentTarget.checked)} />
          Override critical blockers
        </label>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
