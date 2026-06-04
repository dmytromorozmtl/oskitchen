import { cn } from "@/lib/utils";

/**
 * DES-26 — canonical form layout tokens for multi-step wizards.
 *
 * @see lib/design/form-patterns-wizard-steps-audit-policy.ts
 * @see components/ui/wizard-step-form.tsx
 */

export const FORM_PATTERNS_WIZARD_STEPS_POLICY_ID = "form-patterns-wizard-steps-des26-v1" as const;

/** Page shell — Quick Start, onboarding sub-flows. */
export const wizardStepRootClass = cn("mx-auto max-w-2xl space-y-8 pb-16");

/** Eyebrow + title + description block above progress. */
export const wizardStepIntroClass = cn("space-y-3");

/** Step counter row + progress bar. */
export const wizardStepProgressBlockClass = cn("space-y-2");

/** Active step content stack. */
export const wizardStepSectionClass = cn("space-y-4");

export const wizardStepHeadingClass = cn("text-lg font-medium");

export const wizardStepDescriptionClass = cn("text-sm text-muted-foreground");

/** Server/client form wrapper inside a step. */
export const wizardStepFormClass = cn("space-y-4");

/** Label + control pair. */
export const wizardStepFieldClass = cn("space-y-2");

/** Two-column field row on sm+. */
export const wizardStepFieldGridClass = cn("grid gap-3 sm:grid-cols-2");

/** Selectable tile grid (restaurant type, etc.). */
export const wizardStepChoiceGridClass = cn("grid gap-3 sm:grid-cols-2");

/** Vertical choice list (channels). */
export const wizardStepChoiceListClass = cn("grid gap-3");

export const wizardStepChoiceCardClass = cn(
  "rounded-xl border p-4 text-left transition-colors border-border hover:border-primary/40",
);

export const wizardStepChoiceCardSelectedClass = cn(
  "border-primary bg-primary/5 ring-2 ring-primary/30",
);

export const wizardStepChoiceRowSelectedClass = cn("border-primary bg-primary/5");

/** Sticky footer: back / skip / continue. */
export const wizardStepActionsClass = cn(
  "flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6",
);

/** Inline checklist row (channel pilot, vendor onboarding). */
export const wizardStepChecklistItemClass = cn(
  "scroll-mt-24 flex gap-3 rounded-lg border px-3 py-2 text-sm border-border/60",
);

export const wizardStepChecklistItemCurrentClass = cn("border-primary/40 bg-background");

/** Compact vertical stack inside embedded wizards. */
export const wizardStepStackClass = cn("space-y-3");

/** Modules audited for wizard form pattern tokens (DES-26). */
export const WIZARD_FORM_PATTERN_MODULES = [
  "components/onboarding/quick-start-wizard.tsx",
  "components/integrations/channel-pilot-setup-wizard.tsx",
  "components/marketplace/vendor-dashboard-onboarding-wizard.tsx",
] as const;
