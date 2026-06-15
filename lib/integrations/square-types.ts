/** Normalized Square order row from Orders API search. */
export type SquareOrderRow = {
  id: string;
  locationId: string | null;
  state: string | null;
  createdAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  lineItems: SquareLineItemRow[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  note: string | null;
};

export type SquareLineItemRow = {
  uid: string | null;
  name: string;
  quantity: number;
  unitPriceCents: number | null;
  catalogObjectId: string | null;
};

export type SquareImportResult =
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
