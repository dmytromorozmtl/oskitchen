import type { ReactNode } from "react";

import {
  ResponsiveDataList,
  type ResponsiveDataColumn,
} from "@/components/tables/responsive-data-list";
import { MARKETPLACE_MOBILE_CARD_CLASS } from "@/lib/marketplace/mobile-ui";

export type MarketplaceResponsiveColumn<T> = ResponsiveDataColumn<T>;

/** @deprecated Prefer `ResponsiveDataColumn` from `@/components/tables/responsive-data-list`. */
export type { ResponsiveDataColumn as MarketplaceResponsiveColumnAlias };

export function MarketplaceResponsiveDataList<T extends { id: string }>({
  rows,
  columns,
  renderMobileCard,
  emptyMessage = "No rows to display.",
  emptyState,
}: {
  rows: T[];
  columns: MarketplaceResponsiveColumn<T>[];
  renderMobileCard: (row: T) => ReactNode;
  emptyMessage?: string;
  emptyState?: Parameters<typeof ResponsiveDataList<T>>[0]["emptyState"];
}) {
  return (
    <ResponsiveDataList
      rows={rows}
      columns={columns}
      renderMobileCard={renderMobileCard}
      emptyMessage={emptyMessage}
      emptyState={emptyState}
      mobileCardClassName={MARKETPLACE_MOBILE_CARD_CLASS}
    />
  );
}
