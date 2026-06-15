export type QrOrderSourceMetadata = {
  qr?: {
    channel?: string;
    storeSlug?: string;
    tableRouteId?: string;
    tableLabel?: string;
  };
  table?: string;
  tableId?: string;
};

export function buildQrOrderSourceMetadata(input: {
  storeSlug: string;
  tableRouteId: string;
  tableLabel: string;
  restaurantTableId?: string | null;
}): QrOrderSourceMetadata {
  return {
    qr: {
      channel: "table_qr",
      storeSlug: input.storeSlug,
      tableRouteId: input.tableRouteId,
      tableLabel: input.tableLabel,
    },
    table: input.tableLabel,
    tableId: input.restaurantTableId ?? undefined,
  };
}

export function readQrTableLabel(sourceMetadataJson: unknown): string | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const meta = sourceMetadataJson as QrOrderSourceMetadata;
  if (meta.qr?.tableLabel?.trim()) return meta.qr.tableLabel.trim();
  if (meta.table?.trim()) return meta.table.trim();
  return null;
}

export function isQrTableOrder(sourceMetadataJson: unknown): boolean {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return false;
  const meta = sourceMetadataJson as QrOrderSourceMetadata;
  return meta.qr?.channel === "table_qr";
}

export function publicQrOrderPath(storeSlug: string, tableRouteId: string): string {
  const slug = storeSlug.trim();
  const table = encodeURIComponent(tableRouteId.trim());
  return `/q/${slug}/${table}`;
}

export function absoluteQrOrderUrl(storeSlug: string, tableRouteId: string, baseUrl?: string): string {
  const origin = (baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://os-kitchen.com").replace(
    /\/$/,
    "",
  );
  return `${origin}${publicQrOrderPath(storeSlug, tableRouteId)}`;
}
