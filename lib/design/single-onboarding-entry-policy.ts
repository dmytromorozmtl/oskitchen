/**
 * Blueprint P1-57 — Single onboarding entry (Onboarding Hub consolidates 4 legacy paths).
 *
 * @see docs/unified-onboarding-ia.md
 * @see app/dashboard/onboarding-hub/page.tsx
 */

export const SINGLE_ONBOARDING_ENTRY_POLICY_ID = "single-onboarding-entry-p1-57-v1" as const;

export const ONBOARDING_HUB_PATH = "/dashboard/onboarding-hub" as const;

export type LegacyOnboardingEntryId =
  | "launch_wizard"
  | "quick_start"
  | "go_live"
  | "implementation";

export type LegacyOnboardingEntry = {
  id: LegacyOnboardingEntryId;
  title: string;
  description: string;
  href: string;
  recommended?: boolean;
  badge?: "Recommended" | "15 min" | "Advanced" | "Enterprise";
};

/** Four parallel onboarding entry points unified under the hub. */
export const LEGACY_ONBOARDING_ENTRIES: readonly LegacyOnboardingEntry[] = [
  {
    id: "launch_wizard",
    title: "Launch Wizard",
    description:
      "8-step pilot setup with honest P0 blockers — menu, storefront, POS, KDS, integrations, and GO/NO-GO readiness.",
    href: "/dashboard/launch-wizard",
    recommended: true,
    badge: "Recommended",
  },
  {
    id: "quick_start",
    title: "Quick Start",
    description:
      "15-minute self-serve wizard — business profile, first menu, and celebratory first order for new accounts.",
    href: "/dashboard/quick-start",
    badge: "15 min",
  },
  {
    id: "go_live",
    title: "Go-live validation",
    description:
      "Launch projects, simulation runs, and stage gates for operators validating production readiness.",
    href: "/dashboard/go-live?mode=advanced",
    badge: "Advanced",
  },
  {
    id: "implementation",
    title: "Implementation hub",
    description:
      "Commercial implementation projects — checklist, UAT, migration, training, and pilot readiness scorecards.",
    href: "/dashboard/implementation",
    badge: "Enterprise",
  },
] as const;

export const SINGLE_ONBOARDING_ENTRY_LEGACY_HREFS = LEGACY_ONBOARDING_ENTRIES.map(
  (entry) => entry.href.split("?")[0]!,
);

export const SINGLE_ONBOARDING_ENTRY_MODULE =
  "components/dashboard/onboarding-hub/onboarding-hub-view.tsx" as const;

export const SINGLE_ONBOARDING_ENTRY_PAGE = "app/dashboard/onboarding-hub/page.tsx" as const;

export const SINGLE_ONBOARDING_ENTRY_AUDIT_SCRIPT =
  "scripts/audit-single-onboarding-entry.ts" as const;

export const SINGLE_ONBOARDING_ENTRY_NPM_SCRIPT = "audit:single-onboarding-entry" as const;

export const SINGLE_ONBOARDING_ENTRY_UNIT_TEST =
  "tests/unit/single-onboarding-entry.test.ts" as const;

export const SINGLE_ONBOARDING_ENTRY_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export function resolveRecommendedOnboardingEntry(): LegacyOnboardingEntry {
  return LEGACY_ONBOARDING_ENTRIES.find((entry) => entry.recommended) ?? LEGACY_ONBOARDING_ENTRIES[0]!;
}
