/**
 * Restaurant operators see a simplified dashboard without engineering / pilot jargon.
 * Set NEXT_PUBLIC_INTERNAL_OPS_UI=1 to restore internal strips, badges, and platform links.
 */

export function showInternalOpsDashboardUi(options?: {
  platformBypass?: boolean;
}): boolean {
  if (options?.platformBypass) return true;
  return process.env.NEXT_PUBLIC_INTERNAL_OPS_UI === "1";
}

export function showNavStatusBadges(options?: { platformBypass?: boolean }): boolean {
  return showInternalOpsDashboardUi(options);
}

export function isInternalDashboardHref(href: string): boolean {
  const h = href.trim();
  return h.startsWith("/platform") || h.startsWith("/demo");
}

/** Map blocked internal targets to the closest operational dashboard route. */
export function customerFacingDashboardHref(href: string): string {
  if (!isInternalDashboardHref(href)) return href;
  if (href.includes("sso")) return "/dashboard/settings/security/sso";
  if (href.includes("integration")) return "/dashboard/integration-health";
  if (href.includes("launch") || href.includes("pilot") || href.includes("go-convergence")) {
    return "/dashboard/launch-wizard";
  }
  return "/dashboard/today";
}

export function filterCustomerFacingLinks<T extends { href: string }>(
  items: readonly T[],
): T[] {
  return items
    .filter((item) => !isInternalDashboardHref(item.href))
    .map((item) => ({ ...item, href: customerFacingDashboardHref(item.href) }));
}

export function pickCustomerFacingNextAction<
  T extends { href: string; title: string; detail: string; ctaLabel: string },
>(next: T, fallbacks: readonly T[]): T {
  if (!isInternalDashboardHref(next.href)) return next;
  const alt = fallbacks.find((item) => !isInternalDashboardHref(item.href));
  return alt ?? { ...next, href: customerFacingDashboardHref(next.href) };
}
