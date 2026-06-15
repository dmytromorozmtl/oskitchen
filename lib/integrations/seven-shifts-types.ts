/** Normalized shift row from 7shifts API v2. */
export type SevenShiftsShiftRow = {
  id: number;
  userId: number;
  start: string;
  end: string;
  notes: string | null;
  hourlyWage?: number;
  laborCost?: number;
};

export type SevenShiftsImportStats = {
  fetched: number;
  imported: number;
  updated: number;
  skippedUnmapped: number;
};

export type SevenShiftsImportResult =
  | ({ ok: true } & SevenShiftsImportStats & { message: string })
  | ({ ok: false; message: string; imported: number } & Partial<SevenShiftsImportStats>);
