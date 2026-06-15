"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { rollbackTemplateAction } from "@/actions/templates";
import { Button } from "@/components/ui/button";

type Props = {
  applicationId: string;
  available: "full" | "partial" | "none";
};

export function RollbackButton({ applicationId, available }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (available === "none") {
    return (
      <span className="text-xs text-muted-foreground">Rollback not available</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setErr(null);
            setMsg(null);
            const res = await rollbackTemplateAction({ applicationId });
            if (res.ok) {
              setMsg(`Reverted ${res.reverted ?? 0} change(s).`);
              router.refresh();
            } else {
              setErr(res.error ?? "Unable to roll back");
            }
          })
        }
      >
        Rollback
      </Button>
      {msg ? <span className="text-xs text-emerald-700">{msg}</span> : null}
      {err ? <span className="text-xs text-rose-600">{err}</span> : null}
    </div>
  );
}
