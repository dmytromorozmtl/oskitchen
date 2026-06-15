"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/action-result";

export function IntegrationClientForm({
  saveAction,
  children,
}: {
  saveAction: (fd: FormData) => Promise<ActionResult<{ connectionId?: string }>>;
  children: React.ReactNode;
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await saveAction(fd);
      if (!result.ok) {
        setError(getActionError(result) ?? "Something went wrong");
        toast.error(getActionError(result) ?? "Something went wrong");
      } else {
        toast.success("Saved");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <fieldset disabled={pending} className="space-y-4">
        {children}
      </fieldset>
    </form>
  );
}
