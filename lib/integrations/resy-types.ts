export type ResyReservationRow = {
  id: string;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  partySize: number;
  reservedAt: string;
  status?: string | null;
  notes?: string | null;
};

export type ResyImportResult = {
  ok: boolean;
  fetched: number;
  imported: number;
  updated: number;
  skipped: number;
  message: string;
};

export type ResyExportResult = {
  ok: boolean;
  exported: number;
  failed: number;
  message: string;
  errors?: string[];
};

export type ResyReservationStatus = "PENDING" | "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
