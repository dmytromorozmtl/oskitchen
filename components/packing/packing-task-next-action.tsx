import Link from "next/link";

import {
  resolvePackingTaskRowNextAction,
  type PackingTaskFocus,
} from "@/lib/packing/packing-focus-era18";

export function PackingTaskNextAction(props: { task: PackingTaskFocus }) {
  const action = resolvePackingTaskRowNextAction(props.task);

  if (!action) {
    return null;
  }

  return (
    <Link
      href={action.href}
      data-testid={`packing-task-next-action-${props.task.id}`}
      className={
        action.tone === "urgent"
          ? "text-xs font-medium text-destructive hover:underline"
          : "text-xs text-primary hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
