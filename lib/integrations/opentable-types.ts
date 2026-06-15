export type OpenTableReservationRow = {
  id: string;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  partySize: number;
  reservedAt: string;
  status?: string | null;
  notes?: string | null;
};

export type OpenTableImportResult = {
  ok: boolean;
  fetched: number;
  imported: number;
  updated: number;
  skipped: number;
  message: string;
};

export type OpenTableExportResult = {
  ok: boolean;
  exported: number;
  failed: number;
  message: string;
  errors?: string[];
};

export type OpenTableReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SEATED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
