"use client";

import { Button } from "@/components/ui/button";

export default function KdsManagerViewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-border/80 p-6">
      <h2 className="text-lg font-semibold">Manager view unavailable</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Could not load kitchen manager dashboard."}
      </p>
      <Button type="button" onClick={reset} className="rounded-full">
        Try again
      </Button>
    </div>
  );
}
