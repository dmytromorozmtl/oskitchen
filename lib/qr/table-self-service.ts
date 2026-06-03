export type QrTableCheckoutStyle = "pay_later" | "pay_now" | "split";

export type QrTableSplitMetadata = {
  guests: number;
  shareAmount: number;
  paidShares: number;
  currency: string;
};

export type QrTableSelfServiceMetadata = {
  qr?: {
    channel?: string;
    storeSlug?: string;
    tableRouteId?: string;
    tableLabel?: string;
    checkoutStyle?: QrTableCheckoutStyle;
    selfService?: boolean;
  };
  table?: string;
  tableId?: string;
  split?: QrTableSplitMetadata;
};

export function calculateSplitBillShare(total: number, guests: number): number {
  const n = Math.max(1, Math.min(20, Math.round(guests)));
  return Math.round((total / n) * 100) / 100;
}

export function publicTableSelfServicePath(storeSlug: string, tableRouteId: string): string {
  const params = new URLSearchParams({
    store: storeSlug.trim(),
    table: tableRouteId.trim(),
  });
  return `/q/table?${params.toString()}`;
}

export function parseQrTableSelfServiceMetadata(
  sourceMetadataJson: unknown,
): QrTableSelfServiceMetadata | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  return sourceMetadataJson as QrTableSelfServiceMetadata;
}

export function splitBillFullyPaid(meta: QrTableSplitMetadata): boolean {
  return meta.paidShares >= meta.guests;
}
