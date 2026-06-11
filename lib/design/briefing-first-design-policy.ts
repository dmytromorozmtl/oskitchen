/**
 * Blueprint P1-65 — Briefing-first design (Owner Daily Briefing narrative strip).
 *
 * Narrative format: "{period} {delta}. {channel insight}. Next: {action}."
 * Example: "Yesterday +12%. DoorDash orders. Next: menu mix."
 *
 * @see components/dashboard/owner-daily-briefing-hero.tsx
 * @see lib/briefing/briefing-first-narrative.ts
 */

import { cn } from "@/lib/utils";

export const BRIEFING_FIRST_DESIGN_POLICY_ID = "briefing-first-design-p1-65-v1" as const;

export const BRIEFING_FIRST_HERO_MODULE =
  "components/dashboard/owner-daily-briefing-hero.tsx" as const;

export const BRIEFING_FIRST_NARRATIVE_MODULE =
  "lib/briefing/briefing-first-narrative.ts" as const;

export const BRIEFING_FIRST_NARRATIVE_TEST_ID = "owner-briefing-narrative" as const;

/** Prominent narrative strip — briefing-first, above tiles and next-action. */
export const BRIEFING_FIRST_NARRATIVE_WRAPPER_CLASS = cn(
  "rounded-xl border border-primary/20 bg-primary/[0.03] px-3 py-2.5",
);

export const BRIEFING_FIRST_NARRATIVE_CLASS = cn(
  "text-base font-medium leading-snug tracking-tight text-foreground sm:text-lg",
);

export const BRIEFING_FIRST_NARRATIVE_EXAMPLE =
  "Yesterday +12%. DoorDash orders. Next: menu mix." as const;

export const BRIEFING_FIRST_REQUIRED_SEGMENTS = [
  "performance",
  "insight",
  "next",
] as const;

export const BRIEFING_FIRST_DESIGN_AUDIT_SCRIPT =
  "scripts/audit-briefing-first-design.ts" as const;

export const BRIEFING_FIRST_DESIGN_NPM_SCRIPT = "audit:briefing-first-design" as const;

export const BRIEFING_FIRST_DESIGN_UNIT_TEST =
  "tests/unit/briefing-first-design.test.ts" as const;

export const BRIEFING_FIRST_DESIGN_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;
