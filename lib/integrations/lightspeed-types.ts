/** Normalized Lightspeed sale row from Restaurant API. */
export type LightspeedOrderRow = {
  id: string;
  businessLocationId: string | null;
  state: string | null;
  createdAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  lineItems: LightspeedLineItemRow[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  note: string | null;
};

export type LightspeedLineItemRow = {
  id: string | null;
  name: string;
  quantity: number;
  unitPrice: number | null;
  productId: string | null;
};

export type LightspeedImportResult =
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
