/** Normalized Toast order row from Orders API v2. */
export type ToastOrderRow = {
  id: string;
  displayNumber: string | null;
  businessDate: string | null;
  openedAt: string | null;
  state: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  lineItems: ToastLineItemRow[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  note: string | null;
};

export type ToastLineItemRow = {
  guid: string | null;
  name: string;
  quantity: number;
  unitPrice: number | null;
  itemGuid: string | null;
};

export type ToastImportResult =
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
