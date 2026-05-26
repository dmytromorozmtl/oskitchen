import { toCsv } from "@/lib/import-export/csv-format";
import type { OrderHubStorefrontSummary } from "@/lib/storefront/order-hub-commerce";

export const STOREFRONT_ORDERS_CSV_HEADERS = [
  "order_id",
  "created_at",
  "customer_name",
  "customer_email",
  "status",
  "fulfillment_type",
  "creation_source",
  "total",
  "storefront_order_number",
  "market_id",
  "market_name",
  "tax_mode",
  "tax_region_code",
  "tax_total",
  "tax_breakdown_json",
  "cart_schema_version",
  "store_slug",
] as const;

export type OrderExportRowInput = {
  id: string;
  createdAt: Date;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  fulfillmentType: string;
  creationSource: string | null;
  total: { toString(): string };
  storefront: OrderHubStorefrontSummary | null;
};

export function storefrontOrdersToCsv(rows: OrderExportRowInput[]): string {
  const data = rows.map((o) => {
    const sf = o.storefront;
    return [
      o.id,
      o.createdAt.toISOString(),
      o.customerName ?? "",
      o.customerEmail ?? "",
      o.status,
      o.fulfillmentType,
      o.creationSource ?? "",
      Number(o.total),
      sf?.orderNumber ?? "",
      sf?.marketId ?? "",
      sf?.marketName ?? "",
      sf?.taxMode ?? "",
      sf?.taxRegionCode ?? "",
      sf?.taxTotal ?? "",
      sf?.taxBreakdownJson ?? "",
      sf?.schemaVersion ?? "",
      sf?.storeSlug ?? "",
    ];
  });
  return toCsv([...STOREFRONT_ORDERS_CSV_HEADERS], data);
}
