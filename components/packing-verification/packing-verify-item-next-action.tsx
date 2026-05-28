import Link from "next/link";

import {
  resolvePackingVerifyItemRowNextAction,
  type PackingVerifyItemFocus,
} from "@/lib/packing-verification/packing-verify-focus-era18";

export function PackingVerifyItemNextAction(props: { item: PackingVerifyItemFocus }) {
  const action = resolvePackingVerifyItemRowNextAction(props.item);

  if (!action) {
    return null;
  }

  return (
    <Link
      href={action.href}
      data-testid={`packing-verify-item-next-action-${props.item.id}`}
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
