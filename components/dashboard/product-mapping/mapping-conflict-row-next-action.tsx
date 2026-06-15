import Link from "next/link";

import {
  resolveChannelMappingConflictRowNextAction,
  resolveDuplicateMappingGroupRowNextAction,
  type ChannelMappingConflictFocusRow,
} from "@/lib/product-mapping/product-mapping-focus-era18";

export function ChannelMappingConflictRowNextAction(props: { row: ChannelMappingConflictFocusRow }) {
  const action = resolveChannelMappingConflictRowNextAction(props.row);

  return (
    <Link
      href={action.href}
      data-testid={`channel-mapping-conflict-next-action-${props.row.id}`}
      className={
        action.tone === "urgent"
          ? "text-xs font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
          : "text-xs font-medium text-primary underline-offset-2 hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}

export function DuplicateMappingGroupRowNextAction(props: { mappingId: string }) {
  const action = resolveDuplicateMappingGroupRowNextAction(props.mappingId);

  return (
    <Link
      href={action.href}
      data-testid={`duplicate-mapping-group-next-action-${props.mappingId}`}
      className="text-xs font-medium text-primary underline-offset-2 hover:underline"
    >
      {action.label}
    </Link>
  );
}
