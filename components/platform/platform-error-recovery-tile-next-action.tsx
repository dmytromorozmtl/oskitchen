import Link from "next/link";

import { resolvePlatformErrorRecoveryTileRowNextAction } from "@/lib/error-recovery/error-recovery-focus-era18";
import type { PlatformErrorRecoveryTileId } from "@/lib/error-recovery/error-recovery-focus-era18";

export function PlatformErrorRecoveryTileNextAction(props: {
  tileId: PlatformErrorRecoveryTileId;
  count: number;
}) {
  const action = resolvePlatformErrorRecoveryTileRowNextAction(props.tileId, props.count);

  if (!action) {
    return (
      <span
        className="text-sm text-zinc-500"
        data-testid={`platform-error-recovery-tile-clear-${props.tileId}`}
      >
        All clear
      </span>
    );
  }

  return (
    <Link
      href={action.href}
      data-testid={`platform-error-recovery-tile-next-${props.tileId}`}
      className={
        action.tone === "urgent"
          ? "text-sm font-medium text-amber-200 underline-offset-4 hover:underline"
          : "text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
