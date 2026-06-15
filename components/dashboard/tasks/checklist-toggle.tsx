"use client";

import { useTransition } from "react";

import { toggleChecklistAction } from "@/actions/kitchen-task";

export function ChecklistToggle({
  taskId,
  itemId,
  completed,
  label,
}: {
  taskId: string;
  itemId: string;
  completed: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        checked={completed}
        disabled={pending}
        onChange={(e) => {
          const fd = new FormData();
          fd.set("taskId", taskId);
          fd.set("itemId", itemId);
          fd.set("completed", e.target.checked ? "true" : "false");
          startTransition(async () => {
            await toggleChecklistAction(fd);
          });
        }}
        className="mt-0.5 h-4 w-4"
      />
      <span className={completed ? "line-through text-muted-foreground" : ""}>{label}</span>
    </label>
  );
}
