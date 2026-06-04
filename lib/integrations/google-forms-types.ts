/** Normalized Google Forms submission row from linked Sheet. */
export type GoogleFormsSubmissionRow = {
  rowNumber: number;
  submittedAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  itemSummary: string;
  total: number;
  notes: string | null;
};

export type GoogleFormsImportResult =
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
