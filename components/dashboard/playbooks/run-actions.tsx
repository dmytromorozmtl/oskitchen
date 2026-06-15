"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  cancelRunAction,
  completeRunAction,
  generateTasksAction,
} from "@/actions/playbooks";
import { Button } from "@/components/ui/button";

type Props = {
  runId: string;
  canGenerateTasks: boolean;
  tasksGenerated: boolean;
  canComplete: boolean;
};

export function RunActions({ runId, canGenerateTasks, tasksGenerated, canComplete }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canGenerateTasks && !tasksGenerated ? (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setErr(null);
              setMsg(null);
              const res = await generateTasksAction({ runId });
              if (res.ok) setMsg(`Generated ${res.created ?? 0} tasks.`);
              else setErr(res.error ?? "Unable to generate");
              router.refresh();
            })
          }
        >
          Generate tasks
        </Button>
      ) : null}
      {canComplete ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setErr(null);
              const res = await completeRunAction({ runId });
              if (!res.ok) setErr(res.error ?? "Unable to complete");
              router.refresh();
            })
          }
        >
          Complete run
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setErr(null);
            const res = await cancelRunAction({ runId });
            if (!res.ok) setErr(res.error ?? "Unable to cancel");
            router.push("/dashboard/playbooks");
          })
        }
      >
        Cancel run
      </Button>
      {msg ? <span className="text-xs text-emerald-700">{msg}</span> : null}
      {err ? <span className="text-xs text-rose-600">{err}</span> : null}
    </div>
  );
}
