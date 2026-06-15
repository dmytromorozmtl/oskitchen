"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { submitKbFeedbackAction } from "@/actions/kb/feedback";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import type { KbFeedbackStats } from "@/services/kb/knowledge-base-service";
import { Button } from "@/components/ui/button";

export function KbFeedbackButtons({
  articleSlug,
  initialStats,
}: {
  articleSlug: string;
  initialStats: KbFeedbackStats;
}) {
  const router = useRouter();
  const [stats, setStats] = React.useState(initialStats);
  const [pending, startTransition] = React.useTransition();
  const [voted, setVoted] = React.useState<"up" | "down" | null>(null);

  function submit(helpful: boolean) {
    const formData = new FormData();
    formData.set("articleSlug", articleSlug);
    formData.set("helpful", helpful ? "true" : "false");

    startTransition(async () => {
      const res = await submitKbFeedbackAction(formData);
      if (!isActionSuccess(res)) {
        toast.error(getActionError(res) ?? "Could not save feedback");
        return;
      }
      setStats(res.data.stats);
      setVoted(helpful ? "up" : "down");
      toast.success("Thanks for your feedback");
      router.refresh();
    });
  }

  return (
    <div
      data-testid="kb-feedback"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm"
    >
      <span className="text-muted-foreground">Was this article helpful?</span>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={voted === "up" ? "default" : "outline"}
          disabled={pending || voted != null}
          data-testid="kb-feedback-up"
          onClick={() => submit(true)}
        >
          👍 Yes
        </Button>
        <Button
          type="button"
          size="sm"
          variant={voted === "down" ? "default" : "outline"}
          disabled={pending || voted != null}
          data-testid="kb-feedback-down"
          onClick={() => submit(false)}
        >
          👎 No
        </Button>
      </div>
      {(stats.helpful > 0 || stats.notHelpful > 0) && (
        <span className="text-xs text-muted-foreground" data-testid="kb-feedback-stats">
          {stats.helpful} found helpful · {stats.notHelpful} did not
        </span>
      )}
    </div>
  );
}
