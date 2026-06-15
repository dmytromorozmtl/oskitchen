"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  sectionId: string;
  className?: string;
};

export function AiBriefingFeedback({ sectionId, className }: Props) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(helpful: boolean) {
    if (pending || vote != null) return;
    setPending(true);
    try {
      const res = await fetch("/api/telemetry/ai-briefing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, helpful }),
      });
      if (!res.ok) throw new Error("Failed");
      setVote(helpful ? "up" : "down");
      toast.success("Thanks — feedback recorded.");
    } catch {
      toast.error("Could not save feedback. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <span>Was this helpful?</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", vote === "up" && "text-emerald-600")}
        disabled={pending || vote != null}
        aria-label="Helpful"
        onClick={() => submit(true)}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", vote === "down" && "text-red-600")}
        disabled={pending || vote != null}
        aria-label="Not helpful"
        onClick={() => submit(false)}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
