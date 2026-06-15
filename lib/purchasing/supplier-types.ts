/** Lightweight supplier shape for UI and CSV exports (no secrets). */
export type SupplierSummary = {
  id: string;
  name: string;
  active: boolean;
  itemCount: number;
  openPoCount: number;
  contactEmail: string | null;
  leadTimeDays: number | null;
};
