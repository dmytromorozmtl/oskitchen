import Link from "next/link";

import {
  resolveGoLiveChecklistRowNextAction,
  type GoLiveChecklistItemFocus,
} from "@/lib/go-live/go-live-focus-era18";

export function GoLiveChecklistNextAction(props: { item: GoLiveChecklistItemFocus }) {
  const action = resolveGoLiveChecklistRowNextAction(props.item);

  if (!action) {
    return null;
  }

  return (
    <Link
      href={action.href}
      data-testid={`go-live-checklist-next-action-${props.item.id}`}
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
