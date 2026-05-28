import Link from "next/link";

import {
  resolveProductionWorkItemRowNextAction,
  type ProductionBoardWorkItemFocus,
} from "@/lib/production/production-board-focus-era18";

export function ProductionWorkItemNextAction(props: {
  item: ProductionBoardWorkItemFocus;
}) {
  const action = resolveProductionWorkItemRowNextAction(props.item);

  if (!action) {
    return null;
  }

  return (
    <Link
      href={action.href}
      data-testid={`production-work-next-action-${props.item.id}`}
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
