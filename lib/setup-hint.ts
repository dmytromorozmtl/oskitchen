import type { KitchenSettings } from "@prisma/client";

import { dashboardModeSummaryLines } from "@/lib/business-modes";

export type SetupHintPayload = {
  percent: number;
  nextLabel: string;
  nextHref: string;
  /** Why this step matters — shown in the sidebar widget. */
  why: string;
  /** Rough time estimate for the operator. */
  minutes: number;
  /** One-line business-mode nav guidance (focused vs all modules). */
  navModeHint?: string;
};

/**
 * Lightweight setup score from persisted settings only (no extra DB reads).
 * Returns null when basic workspace setup is complete (sidebar hides the widget).
 */
export function buildWorkspaceSetupHint(settings: KitchenSettings | null): SetupHintPayload | null {
  if (!settings) return null;
  const steps: { ok: boolean; label: string; href: string; why: string; minutes: number }[] = [
    {
      ok: Boolean(settings.businessName?.trim()),
      label: "Add your business name",
      href: "/dashboard/settings/workspace",
      why: "Shows on invoices, emails, and your storefront.",
      minutes: 1,
    },
    {
      ok: Boolean(settings.businessType),
      label: "Choose business mode",
      href: "/dashboard/settings/workspace",
      why: "Unlocks the right modules and language across KitchenOS.",
      minutes: 2,
    },
    {
      ok: Boolean(settings.pickupAddress?.trim() || settings.deliveryEnabled),
      label: "Set pickup or delivery rules",
      href: "/dashboard/settings",
      why: "Guests need to know how and where they receive orders.",
      minutes: 2,
    },
    {
      ok: Boolean(settings.pickupWindows?.trim() || settings.deliveryEnabled),
      label: "Configure pickup windows",
      href: "/dashboard/settings",
      why: "Prevents impossible pickup promises during busy services.",
      minutes: 2,
    },
    {
      ok: Boolean(settings.logoUrl?.trim()),
      label: "Upload a logo",
      href: "/dashboard/settings/branding",
      why: "Builds trust on printed tickets and your public pages.",
      minutes: 2,
    },
  ];
  const done = steps.filter((s) => s.ok).length;
  const total = steps.length;
  const next = steps.find((s) => !s.ok);
  if (!next) return null;
  const percent = Math.round((done / total) * 100);
  const businessType = settings.businessType ?? "MEAL_PREP";
  const navModeHint = dashboardModeSummaryLines(businessType)[0];

  return {
    percent,
    nextLabel: `${next.label} · ~${next.minutes} min`,
    nextHref: next.href,
    why: next.why,
    minutes: next.minutes,
    navModeHint,
  };
}
