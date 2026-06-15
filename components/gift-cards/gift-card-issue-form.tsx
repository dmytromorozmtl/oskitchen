"use client";

import { getActionError } from "@/lib/action-result";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createGiftCardAction } from "@/actions/gift-cards";

export function GiftCardIssueForm() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await createGiftCardAction(fd);
    setPending(false);

    const _err = getActionError(result); if (_err) { toast.error(_err);
      return;
    }

    toast.success("Gift card created");
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 max-w-md">
      <input
        name="amount"
        type="number"
        step="0.01"
        required
        placeholder="Amount ($)"
        className="h-10 rounded-xl border px-3 text-sm"
      />
      <input
        name="code"
        placeholder="Custom code (optional)"
        className="h-10 rounded-xl border px-3 text-sm font-mono uppercase"
      />
      <input
        name="purchaserEmail"
        type="email"
        placeholder="Purchaser email"
        className="h-10 rounded-xl border px-3 text-sm"
      />
      <input name="notes" placeholder="Notes (optional)" className="h-10 rounded-xl border px-3 text-sm" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create card"}
      </button>
    </form>
  );
}
