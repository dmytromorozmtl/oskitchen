import {
  PACKING_QC_CLARITY_ANCHOR,
  PACKING_QC_CLARITY_ERA19_POLICY_ID,
  PACKING_QC_CLARITY_ROUTE,
} from "@/lib/packing/packing-qc-clarity-era19-policy";
import type { PackingFocusSnapshot } from "@/lib/packing/packing-focus-era18";
import { PACKING_VERIFY_ROUTE } from "@/lib/packing/packing-focus-era18-policy";

export const PACKING_QC_CLARITY_AGGREGATOR_ERA19_POLICY_ID =
  "era19-packing-qc-clarity-aggregator-v1" as const;

export type PackingQcChecklistStepId =
  | "review_pack_focus"
  | "clear_allergen_gaps"
  | "log_labels_and_pack"
  | "verify_before_handoff";

export type PackingQcChecklistStepStatus = "pending" | "active" | "complete" | "blocked";

export type PackingQcChecklistStep = {
  id: PackingQcChecklistStepId;
  label: string;
  detail: string;
  status: PackingQcChecklistStepStatus;
};

export type PackingQcHeroTone = "urgent" | "success" | "neutral";

export function buildPackingQcClarityHref(): string {
  return `${PACKING_QC_CLARITY_ROUTE}#${PACKING_QC_CLARITY_ANCHOR}`;
}

export function resolvePackingBriefingQcHref(input: {
  packingQueueOpen: number;
  fallbackHref?: string;
}): string {
  if (input.packingQueueOpen > 0) {
    return buildPackingQcClarityHref();
  }
  return input.fallbackHref ?? PACKING_QC_CLARITY_ROUTE;
}

export function buildPackingQcChecklist(input: {
  focus: PackingFocusSnapshot;
  hasTasks: boolean;
}): PackingQcChecklistStep[] {
  const { focus, hasTasks } = input;
  const allergenBlocked = focus.allergenOpenCount > 0;

  const reviewDetail = !hasTasks
    ? "Generate today's pack queue before starting QC."
    : `${focus.allergenOpenCount} allergen · ${focus.labelsMissingCount} labels · ${focus.packedUnverifiedCount} verify · ${focus.queuedCount} queued`;

  const allergenDetail =
    focus.allergenOpenCount > 0
      ? `Complete allergen verification on ${focus.allergenOpenCount} line(s) before handoff.`
      : "No open allergen checks on today's pack lines.";

  const labelsDetail = allergenBlocked
    ? "Clear allergen gaps before logging labels."
    : focus.labelsMissingCount > 0
      ? `Log label prints for ${focus.labelsMissingCount} line(s) still missing compliance labels.`
      : focus.queuedCount > 0
        ? `${focus.queuedCount} line(s) queued — pack and log labels as lines complete.`
        : "Labels logged for active pack lines.";

  const verifyDetail = allergenBlocked
    ? "Allergen checks block verify sign-off."
    : focus.packedUnverifiedCount > 0
      ? `${focus.packedUnverifiedCount} packed line(s) need verify on ${PACKING_VERIFY_ROUTE}.`
      : focus.queuedCount > 0 || focus.labelsMissingCount > 0
        ? "Finish pack and label steps before verify sign-off."
        : "No packed lines awaiting verify.";

  return [
    {
      id: "review_pack_focus",
      label: "Review pack focus",
      detail: reviewDetail,
      status: !hasTasks ? "blocked" : "complete",
    },
    {
      id: "clear_allergen_gaps",
      label: "Clear allergen gaps",
      detail: allergenDetail,
      status: !hasTasks ? "blocked" : focus.allergenOpenCount > 0 ? "active" : "complete",
    },
    {
      id: "log_labels_and_pack",
      label: "Log labels and pack lines",
      detail: labelsDetail,
      status: !hasTasks
        ? "blocked"
        : allergenBlocked
          ? "blocked"
          : focus.labelsMissingCount > 0 || focus.queuedCount > 0
            ? "active"
            : "complete",
    },
    {
      id: "verify_before_handoff",
      label: "Verify before handoff",
      detail: verifyDetail,
      status: !hasTasks
        ? "blocked"
        : allergenBlocked
          ? "blocked"
          : focus.packedUnverifiedCount > 0
            ? "active"
            : focus.queuedCount === 0 &&
                focus.labelsMissingCount === 0 &&
                focus.allergenOpenCount === 0
              ? "complete"
              : "pending",
    },
  ];
}

export function buildPackingQcHero(input: {
  focus: PackingFocusSnapshot;
  hasTasks: boolean;
}): {
  headline: string;
  subline: string;
  tone: PackingQcHeroTone;
} {
  if (!input.hasTasks) {
    return {
      headline: "Packing QC — generate today's queue",
      subline: "Create pack lines below, then follow the 4-step QC checklist.",
      tone: "neutral",
    };
  }

  if (input.focus.allergenOpenCount > 0) {
    return {
      headline: `${input.focus.allergenOpenCount} allergen check${input.focus.allergenOpenCount === 1 ? "" : "s"} open`,
      subline: "Verify allergens before labels, pack verify, or customer handoff.",
      tone: "urgent",
    };
  }

  if (input.focus.labelsMissingCount > 0) {
    return {
      headline: `${input.focus.labelsMissingCount} label${input.focus.labelsMissingCount === 1 ? "" : "s"} missing`,
      subline: "Log printed labels on pack lines before moving to verify.",
      tone: "urgent",
    };
  }

  if (input.focus.packedUnverifiedCount > 0) {
    return {
      headline: `${input.focus.packedUnverifiedCount} line${input.focus.packedUnverifiedCount === 1 ? "" : "s"} awaiting verify`,
      subline: "Open packing verify to complete QC sign-off before handoff.",
      tone: "neutral",
    };
  }

  if (input.focus.queuedCount > 0) {
    return {
      headline: `${input.focus.queuedCount} line${input.focus.queuedCount === 1 ? "" : "s"} in pack queue`,
      subline: "Work oldest-first — log labels and verify as each line completes.",
      tone: "neutral",
    };
  }

  return {
    headline: "Packing QC clear for this shift",
    subline: "No allergen, label, or verify gaps on today's pack lines.",
    tone: "success",
  };
}

export function summarizePackingQcChecklist(steps: readonly PackingQcChecklistStep[]): {
  completedCount: number;
  activeStepId: PackingQcChecklistStepId | null;
  qcClear: boolean;
} {
  const completedCount = steps.filter((step) => step.status === "complete").length;
  const active = steps.find((step) => step.status === "active") ?? null;
  const qcClear = steps.every(
    (step) => step.status === "complete" || step.status === "blocked",
  ) && steps.some((step) => step.status === "complete");

  return {
    completedCount,
    activeStepId: active?.id ?? null,
    qcClear,
  };
}

export function packingQcChecklistStepClassName(status: PackingQcChecklistStepStatus): string {
  switch (status) {
    case "complete":
      return "border-green-200/80 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/20";
    case "active":
      return "border-primary/40 bg-primary/5";
    case "blocked":
      return "border-border/60 bg-muted/20 opacity-80";
    default:
      return "border-border/70 bg-background/80";
  }
}

export function packingQcPolicySnapshot(): {
  policyId: typeof PACKING_QC_CLARITY_ERA19_POLICY_ID;
  qcHref: ReturnType<typeof buildPackingQcClarityHref>;
} {
  return {
    policyId: PACKING_QC_CLARITY_ERA19_POLICY_ID,
    qcHref: buildPackingQcClarityHref(),
  };
}
