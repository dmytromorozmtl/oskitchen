/** Pure closeout math for POS shift close — used by pos-shift-service and spot-check tests. */

export type ShiftCloseoutInput = {
  openingCash: number;
  cashSalesTotals: readonly number[];
  closingCash: number;
};

export type ShiftCloseoutResult = {
  cashSalesTotal: number;
  expectedCash: number;
  variance: number;
};

export type ReceiptTotalsInput = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  lineTotals?: readonly number[];
};

const MONEY_EPSILON = 0.001;

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Sum completed CASH transaction totals for shift closeout (card sales excluded). */
export function sumCashTransactionTotals(totals: readonly number[]): number {
  return roundMoney(totals.reduce((acc, value) => acc + value, 0));
}

/** expected = opening + cash sales; variance = closing - expected */
export function computeShiftCloseout(input: ShiftCloseoutInput): ShiftCloseoutResult {
  const cashSalesTotal = sumCashTransactionTotals(input.cashSalesTotals);
  const expectedCash = roundMoney(input.openingCash + cashSalesTotal);
  const variance = roundMoney(input.closingCash - expectedCash);
  return { cashSalesTotal, expectedCash, variance };
}

export function receiptTotalsConsistent(input: ReceiptTotalsInput): boolean {
  const expectedTotal = roundMoney(input.subtotal - input.discount + input.tax);
  if (Math.abs(expectedTotal - roundMoney(input.total)) > MONEY_EPSILON) {
    return false;
  }
  if (input.lineTotals && input.lineTotals.length > 0) {
    const linesSum = roundMoney(
      input.lineTotals.reduce((acc, lineTotal) => acc + lineTotal, 0),
    );
    if (Math.abs(linesSum - roundMoney(input.subtotal)) > MONEY_EPSILON) {
      return false;
    }
  }
  return true;
}

export function formatShiftCloseoutSummary(result: ShiftCloseoutResult & ShiftCloseoutInput): string {
  return `opening ${result.openingCash.toFixed(2)} + cash sales ${result.cashSalesTotal.toFixed(2)} = expected ${result.expectedCash.toFixed(2)}; counted ${result.closingCash.toFixed(2)}; variance ${result.variance.toFixed(2)}`;
}
