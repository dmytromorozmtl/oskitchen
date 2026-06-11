/** P1-24 — permanently hidden from tenant sidebar (URL still works). */
export const NAV_AUDIT_SUPPRESSED_PREFIXES = [
  "/dashboard/settings/hardware",
  "/dashboard/pos/settings/hardware",
  "/dashboard/customers/loyalty",
  "/dashboard/storefront/loyalty",
  "/dashboard/loyalty",
  "/dashboard/qr-codes",
] as const;

function normalizeHref(href: string): string {
  return href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
}

export function isNavAuditSuppressedHref(href: string): boolean {
  const h = normalizeHref(href);
  return NAV_AUDIT_SUPPRESSED_PREFIXES.some((prefix) => h === prefix || h.startsWith(`${prefix}/`));
}
