/**
 * Blueprint P1-62 — KDS bump ticket UX (large target, haptic, visual confirmation, 3s undo).
 *
 * @see components/kitchen/kds-daily-service.tsx
 * @see components/kitchen/kds-bump-next-strip.tsx
 * @see lib/kitchen/kds-haptics.ts
 */

import { cn } from "@/lib/utils";
import { kdsBumpButtonClass } from "@/lib/kitchen/kds-touch-targets";

export const KDS_BUMP_TICKET_UX_POLICY_ID = "kds-bump-ticket-ux-p1-62-v1" as const;

export const KDS_BUMP_TICKET_UX_REQUIRED_ELEMENTS = [
  "large_target",
  "haptic",
  "visual_confirmation",
  "undo_3s",
] as const;

export type KdsBumpTicketUxElement = (typeof KDS_BUMP_TICKET_UX_REQUIRED_ELEMENTS)[number];

/** Oversized bump CTA for gloved expo line — 64px floor. */
export const KDS_BUMP_TICKET_MIN_TOUCH_PX = 64 as const;

export const KDS_BUMP_TICKET_BUTTON_CLASS = cn(
  kdsBumpButtonClass,
  "min-h-16 text-lg shadow-md",
);

export const KDS_BUMP_TICKET_CONFIRMATION_CLASS =
  "ring-4 ring-emerald-400/70 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01] motion-reduce:scale-100" as const;

export const KDS_BUMP_TICKET_CONFIRMATION_MS = 1500 as const;

export const KDS_BUMP_TICKET_UNDO_WINDOW_MS = 3000 as const;

export const KDS_BUMP_TICKET_UNDO_STRIP_TEST_ID = "kds-bump-undo-strip" as const;

export const KDS_BUMP_TICKET_UNDO_BUTTON_TEST_ID = "kds-bump-undo-button" as const;

export const KDS_BUMP_TICKET_DAILY_SERVICE_MODULE =
  "components/kitchen/kds-daily-service.tsx" as const;

export const KDS_BUMP_TICKET_NEXT_STRIP_MODULE =
  "components/kitchen/kds-bump-next-strip.tsx" as const;

export const KDS_BUMP_TICKET_UNDO_STRIP_MODULE =
  "components/kitchen/kds-bump-undo-strip.tsx" as const;

export const KDS_BUMP_TICKET_HAPTICS_MODULE = "lib/kitchen/kds-haptics.ts" as const;

export const KDS_BUMP_TICKET_UX_AUDIT_SCRIPT =
  "scripts/audit-kds-bump-ticket-ux.ts" as const;

export const KDS_BUMP_TICKET_UX_NPM_SCRIPT = "audit:kds-bump-ticket-ux" as const;

export const KDS_BUMP_TICKET_UX_UNIT_TEST =
  "tests/unit/kds-bump-ticket-ux.test.ts" as const;

export const KDS_BUMP_TICKET_UX_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;
