"use client";

import { useTransition } from "react";

import { updateKitchenTaskStatusAction } from "@/actions/kitchen-task";
import { Button } from "@/components/ui/button";
import type { KitchenTaskStatus } from "@prisma/client";

export function QuickStatusButton({
  taskId,
  to,
  variant = "outline",
  label,
}: {
  taskId: string;
  to: KitchenTaskStatus;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={() => {
        const merged = new FormData();
        merged.set("id", taskId);
        merged.set("status", to);
        startTransition(async () => {
          await updateKitchenTaskStatusAction(merged);
        });
      }}
    >
      <Button size="sm" variant={variant} type="submit" disabled={pending} className="rounded-full">
        {pending ? "…" : label}
      </Button>
    </form>
  );
}
