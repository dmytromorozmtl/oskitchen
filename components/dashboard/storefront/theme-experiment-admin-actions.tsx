"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  applyExperimentWinnerAction,
  concludeThemeExperimentAction,
  retryThemeExperimentEdgeSyncAction,
} from "@/actions/storefront-theme-experiment";
import { Button } from "@/components/ui/button";
import type { ExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
export function ThemeExperimentEdgeSyncRetry({
  canRetry,
}: {
  canRetry: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  if (!canRetry) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await retryThemeExperimentEdgeSyncAction();
          const _err = getActionError(res); if (_err) toast.error(_err);
          else if (res && "ok" in res && res.ok && res.synced) toast.success("Edge sync completed");
          else toast.message("Edge sync queued — refresh in a minute");
          router.refresh();
        });
      }}
    >
      {pending ? "Retrying…" : "Retry edge sync"}
    </Button>
  );
}

export function ThemeExperimentLifecycleActions({
  decision,
  experimentEnabled,
}: {
  decision: ExperimentProdDecision;
  experimentEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  if (!experimentEnabled) return null;
  if (
    decision.recommendation !== "publish_draft" &&
    decision.recommendation !== "keep_published"
  ) {
    return null;
  }

  const outcome = decision.recommendation === "publish_draft" ? "publish_draft" : "keep_published";
  const label =
    outcome === "publish_draft"
      ? "End experiment without publishing"
      : "End experiment (keep published)";

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="rounded-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const fd = new FormData();
          fd.set("outcome", outcome);
          const res = await concludeThemeExperimentAction(fd);
          const _err = getActionError(res); if (_err) { toast.error(_err);
            return;
          }
          toast.success(
            outcome === "publish_draft"
              ? "Experiment ended — edge config clearing"
              : "Experiment ended — all guests on published theme",
          );
          router.refresh();
        });
      }}
    >
      {pending ? "Ending…" : label}
    </Button>
  );
}

export function ThemeExperimentApplyWinner({
  canApply,
  days,
}: {
  canApply: boolean;
  days: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  if (!canApply) return null;

  return (
    <Button
      type="button"
      size="sm"
      className="rounded-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await applyExperimentWinnerAction(days);
          const _err = getActionError(res); if (_err) { toast.error(_err);
            return;
          }
          toast.success("Draft theme published — experiment ended and edge cleared");
          router.refresh();
        });
      }}
    >
      {pending ? "Applying…" : "Apply winner (publish + end)"}
    </Button>
  );
}
