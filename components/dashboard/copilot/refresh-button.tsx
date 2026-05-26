"use client";

import { useTransition } from "react";

import { refreshDeterministicAction } from "@/actions/copilot";

export function RefreshDeterministicButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => { await refreshDeterministicAction(); })}
      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
    >
      {pending ? "Refreshing…" : "Refresh insights"}
    </button>
  );
}
