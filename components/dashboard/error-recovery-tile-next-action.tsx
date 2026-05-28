import Link from "next/link";

import {
  resolveErrorRecoveryTileRowNextAction,
  type ErrorRecoveryTileContext,
  type ErrorRecoveryTileId,
} from "@/lib/error-recovery/error-recovery-focus-era18";

export function ErrorRecoveryTileNextAction(props: {
  tileId: ErrorRecoveryTileId;
  context: ErrorRecoveryTileContext;
}) {
  const action = resolveErrorRecoveryTileRowNextAction(props.tileId, props.context);

  if (!action) {
    return (
      <span className="text-sm text-muted-foreground" data-testid={`error-recovery-tile-clear-${props.tileId}`}>
        All clear
      </span>
    );
  }

  return (
    <Link
      href={action.href}
      data-testid={`error-recovery-tile-next-${props.tileId}`}
      className={
        action.tone === "urgent"
          ? "text-sm font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-200"
          : "text-sm font-medium text-primary underline-offset-4 hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
