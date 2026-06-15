/** Normalized Clover order row from REST API v3. */
export type CloverOrderRow = {
  id: string;
  merchantId: string | null;
  state: string | null;
  createdAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  lineItems: CloverLineItemRow[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  note: string | null;
};

export type CloverLineItemRow = {
  id: string | null;
  name: string;
  quantity: number;
  unitPriceCents: number | null;
  itemId: string | null;
};

export type CloverImportResult =
  | {
      ok: true;
      fetched: number;
      imported: number;
      skippedExisting: number;
      message: string;
    }
  | {
      ok: false;
      message: string;
      fetched: number;
      imported: number;
    };
