"use client";

import { useState, useTransition } from "react";

import { refreshDeterministicAction } from "@/actions/copilot";

export function RefreshDeterministicButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p role="alert" className="max-w-md text-right text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await refreshDeterministicAction();
            if (!result.ok) setError(result.error ?? "You do not have permission to use Copilot.");
          })
        }
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Refreshing…" : "Refresh insights"}
      </button>
    </div>
  );
}
