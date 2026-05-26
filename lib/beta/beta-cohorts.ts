import type { BusinessType } from "@prisma/client";

export type BetaCohortSeedTemplate = {
  name: string;
  targetVertical: BusinessType | null;
  targetRegion: string | null;
  notes: string;
};

/** Starter templates founders can clone when creating cohorts in Studio / admin flows. */
export const BETA_COHORT_TEMPLATES: readonly BetaCohortSeedTemplate[] = [
  {
    name: "Meal prep alpha",
    targetVertical: "MEAL_PREP",
    targetRegion: null,
    notes: "Weekly preorder operators — feature focus: cutoff windows & packing.",
  },
  {
    name: "Ghost kitchen pilot",
    targetVertical: "GHOST_KITCHEN",
    targetRegion: null,
    notes: "Multi-brand delivery density — integrations-heavy onboarding.",
  },
  {
    name: "Enterprise catering",
    targetVertical: "CATERING",
    targetRegion: null,
    notes: "Quote-to-calendar workflows — ARR expansion track.",
  },
  {
    name: "Bakery preorder cohort",
    targetVertical: "BAKERY",
    targetRegion: null,
    notes: "Labeling + pickup queues; lighter channel count typical.",
  },
];
