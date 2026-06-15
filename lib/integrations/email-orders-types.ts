/** Parsed fields from pasted email order text. */
export type EmailOrderParsedLine = {
  title: string;
  quantity: number;
  unitPrice: number | null;
};

export type EmailOrderParsedIntake = {
  contentHash: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  subject: string | null;
  lineItems: EmailOrderParsedLine[];
  total: number;
  bodyExcerpt: string;
};

export type EmailOrderIntakeResult =
  | {
      ok: true;
      imported: boolean;
      skippedExisting: boolean;
      orderId?: string;
      message: string;
      parsed: EmailOrderParsedIntake;
    }
  | {
      ok: false;
      message: string;
    };
