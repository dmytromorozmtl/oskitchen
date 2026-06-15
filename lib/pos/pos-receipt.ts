/** Default receipt footer when kitchen settings do not override copy. */
export const POS_RECEIPT_DEFAULT_FOOTER =
  "Thank you — prepared fresh per your kitchen workflow. Returns per store policy.";

export type PosReceiptBuildInput = {
  businessName: string | null;
  locationLabel: string | null;
  receiptNumber: string;
  orderId: string;
  footer?: string | null;
};
