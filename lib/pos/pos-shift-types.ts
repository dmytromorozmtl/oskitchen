export type PosShiftSummary = {
  id: string;
  registerId: string;
  status: string;
  openedAt: Date;
  closedAt: Date | null;
  openingCashAmount: string;
  closingCashAmount: string | null;
};
