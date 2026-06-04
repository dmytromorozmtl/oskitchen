/** Normalized shift row from Homebase API. */
export type HomebaseShiftRow = {
  id: string;
  userId: string;
  startAt: string;
  endAt: string;
  notes: string | null;
};

export type HomebaseImportStats = {
  fetched: number;
  imported: number;
  updated: number;
  skippedUnmapped: number;
};

export type HomebaseImportResult =
  | ({ ok: true } & HomebaseImportStats & { message: string })
  | ({ ok: false; message: string; imported: number } & Partial<HomebaseImportStats>);
