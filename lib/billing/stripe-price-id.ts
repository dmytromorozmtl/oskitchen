/** Stripe Checkout price ids must be `price_…`, not product ids. */
export function isValidStripePriceId(value: string | undefined): boolean {
  const v = value?.trim();
  return Boolean(v && v.startsWith("price_"));
}
