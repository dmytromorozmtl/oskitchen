/**
 * Billing-related route matching — safe for client bundles (no DB / Prisma).
 */
export function billingOnlyPaths(): string[] {
  return ["/dashboard/billing", "/help", "/book-demo", "/pricing"];
}

export function isBillingPath(pathname: string): boolean {
  return billingOnlyPaths().some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
