import Link from "next/link";

import { resolveGoLiveBlockerRowNextAction } from "@/lib/go-live/go-live-focus-era18";
import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";

export function GoLiveBlockerNextAction(props: { blocker: LaunchBlocker }) {
  const action = resolveGoLiveBlockerRowNextAction(props.blocker);

  if (!action) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Link
      href={action.href}
      data-testid={`go-live-blocker-next-action-${props.blocker.key}`}
      className={
        action.tone === "urgent"
          ? "text-sm font-medium text-destructive hover:underline"
          : "text-sm text-primary hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
