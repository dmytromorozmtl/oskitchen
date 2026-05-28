import Link from "next/link";

import {
  resolvePlatformSystemHealthTileRowNextAction,
  type PlatformSystemHealthTileId,
} from "@/lib/system-health/system-health-focus-era18";

export function PlatformSystemHealthTileNextAction(props: {
  tileId: PlatformSystemHealthTileId;
  value: number;
}) {
  const action = resolvePlatformSystemHealthTileRowNextAction(props.tileId, props.value);

  if (!action) {
    return (
      <span
        className="text-sm text-zinc-500"
        data-testid={`platform-system-health-tile-clear-${props.tileId}`}
      >
        All clear
      </span>
    );
  }

  return (
    <Link
      href={action.href}
      data-testid={`platform-system-health-tile-next-${props.tileId}`}
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
