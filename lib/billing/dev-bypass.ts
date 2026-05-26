/**
 * When `DEV_BYPASS_BILLING=true` and NODE_ENV is `development`, subscription / trial
 * restrictions are not enforced (local productivity).
 */
export function isBillingBypassed(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_BILLING === "true"
  );
}
