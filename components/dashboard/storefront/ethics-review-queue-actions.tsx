"use client";

import { useActionState } from "react";

import { submitEthicsReviewAction } from "@/actions/experiment-ethics-review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EthicsReviewEntry } from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export function EthicsReviewQueueActions({
  pendingReviews,
}: {
  pendingReviews: EthicsReviewEntry[];
}) {
  const [state, formAction, pending] = useActionState(submitEthicsReviewAction, null);
  const next = pendingReviews[0];

  if (!next) {
    return <p className="text-xs text-muted-foreground">No pending ethics reviews.</p>;
  }

  return (
    <form action={formAction} className="space-y-2 border-t border-border/60 pt-3">
      <p className="text-xs font-medium">Human review (prod)</p>
      <input type="hidden" name="reviewId" value={next.reviewId} />
      <Input
        name="rationale"
        placeholder="Rationale for approve/veto"
        className="text-xs"
        defaultValue={next.rationale.slice(0, 80)}
        disabled={pending}
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          name="status"
          value="approved"
          size="sm"
          variant="default"
          className="rounded-full"
          disabled={pending}
        >
          Approve
        </Button>
        <Button
          type="submit"
          name="status"
          value="vetoed"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={pending}
        >
          Veto
        </Button>
      </div>
      {state?.error ? (
        <p className="text-xs text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? <p className="text-xs text-emerald-700">Review recorded.</p> : null}
    </form>
  );
}
