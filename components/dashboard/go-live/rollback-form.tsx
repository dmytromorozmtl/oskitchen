"use client";

import { useState, useTransition } from "react";

import { createRollbackPlanAction } from "@/actions/go-live";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RollbackPlanForm({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await createRollbackPlanAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save plan.");
          }
        })
      }
    >
      <input type="hidden" name="projectId" value={projectId} />
      <Input name="title" placeholder="Plan title" required />
      <Input name="triggerCondition" placeholder="When does this plan activate?" required />
      <textarea
        name="steps"
        required
        placeholder="One step per line"
        className="min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm md:col-span-2"
      />
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save plan"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
