"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { startRunAction } from "@/actions/playbooks";
import { Button } from "@/components/ui/button";

type Props = {
  playbookId: string;
  brandId?: string | null;
  locationId?: string | null;
  dueAt?: string | null;
  label?: string;
  generateTasks?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default";
};

export function StartRunButton({
  playbookId,
  brandId,
  locationId,
  dueAt,
  label = "Run playbook",
  generateTasks = false,
  variant = "default",
  size = "default",
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setErr(null);
            const res = await startRunAction({
              playbookId,
              brandId: brandId ?? null,
              locationId: locationId ?? null,
              dueAt: dueAt ?? null,
              generateTasks,
            });
            if (res.ok && res.runId) {
              router.push(`/dashboard/playbooks/runs/${res.runId}`);
            } else {
              setErr(res.error ?? "Unable to start");
            }
          })
        }
      >
        {pending ? "Starting…" : label}
      </Button>
      {err ? <p className="text-xs text-rose-600">{err}</p> : null}
    </div>
  );
}
