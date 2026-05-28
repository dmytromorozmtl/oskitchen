import Link from "next/link";

import {
  resolveProductMappingRowNextAction,
  type ProductMappingFocusRow,
} from "@/lib/product-mapping/product-mapping-focus-era18";

export function MappingRowNextAction(props: {
  row: ProductMappingFocusRow;
  basePath?: string;
}) {
  const action = resolveProductMappingRowNextAction(props.row, props.basePath);

  if (!action) {
    return null;
  }

  return (
    <Link
      href={action.href}
      data-testid={`product-mapping-next-action-${props.row.id}`}
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
