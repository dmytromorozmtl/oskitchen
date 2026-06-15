"use client";

import { useState, useTransition } from "react";

import { recordProgressAction } from "@/actions/training";
import { Button } from "@/components/ui/button";

export function LessonProgressControls({
  assignmentId,
  lessonId,
  currentPercent,
}: {
  assignmentId: string;
  lessonId: string;
  currentPercent: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [percent, setPercent] = useState(currentPercent);

  function send(value: number, completed = false) {
    const formData = new FormData();
    formData.append("assignmentId", assignmentId);
    formData.append("lessonId", lessonId);
    formData.append("progressPercent", String(value));
    if (completed) formData.append("completed", "true");
    startTransition(async () => {
      setError(null);
      try {
        await recordProgressAction(formData);
        setPercent(value);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save progress.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => send(25)}>
        25%
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => send(50)}>
        50%
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => send(75)}>
        75%
      </Button>
      <Button type="button" size="sm" disabled={isPending} onClick={() => send(100, true)}>
        Mark complete
      </Button>
      <span className="text-xs text-muted-foreground">{percent}%</span>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
