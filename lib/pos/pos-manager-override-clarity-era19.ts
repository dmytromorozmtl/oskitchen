import type { PaymentModeKey } from "@/lib/orders/order-payment";
import type { PosTerminalDiscountMode } from "@/lib/pos/pos-terminal-discount-ui";
import { POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID } from "@/lib/pos/pos-manager-override-clarity-era19-policy";

export const POS_MANAGER_OVERRIDE_CLARITY_AGGREGATOR_ERA19_POLICY_ID =
  "era19-pos-manager-override-clarity-aggregator-v1" as const;

export type PosManagerOverrideChecklistStepId =
  | "manager_permission"
  | "choose_override"
  | "set_discount"
  | "review_complete";

export type PosManagerOverrideChecklistStepStatus =
  | "pending"
  | "active"
  | "complete"
  | "blocked";

export type PosManagerOverrideChecklistStep = {
  id: PosManagerOverrideChecklistStepId;
  label: string;
  detail: string;
  status: PosManagerOverrideChecklistStepStatus;
};

export type PosManagerOverrideChecklistInput = {
  canApplyPosDiscount: boolean;
  discountMode: PosTerminalDiscountMode;
  paymentMode: PaymentModeKey | string;
  cartSubtotal: number;
  cartItemCount: number;
  fixedDiscountInvalid: boolean;
  percentDiscountInvalid: boolean;
  fixedDiscountInput: string;
  percentDiscountInput: string;
  appliedDiscountAmount: number;
  amountDue: number;
};

export function formatPosManagerOverrideMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function isPosManagerOverrideTypeSelected(
  input: Pick<PosManagerOverrideChecklistInput, "discountMode" | "paymentMode">,
): boolean {
  return input.paymentMode === "COMPED" || input.discountMode !== "none";
}

export function isPosManagerOverrideDiscountValueValid(
  input: PosManagerOverrideChecklistInput,
): boolean {
  if (!input.canApplyPosDiscount) return false;
  if (input.paymentMode === "COMPED") return true;
  if (input.discountMode === "none") return true;
  if (input.discountMode === "fixed") {
    if (input.fixedDiscountInvalid) return false;
    return input.fixedDiscountInput.trim().length > 0 || input.appliedDiscountAmount > 0;
  }
  if (input.discountMode === "percent") {
    if (input.percentDiscountInvalid) return false;
    return input.percentDiscountInput.trim().length > 0 || input.appliedDiscountAmount > 0;
  }
  return false;
}

export function canCompletePosManagerOverrideSale(
  input: PosManagerOverrideChecklistInput,
): boolean {
  if (!input.canApplyPosDiscount) return false;
  if (input.cartItemCount <= 0) return false;
  if (input.fixedDiscountInvalid || input.percentDiscountInvalid) return false;
  if (!isPosManagerOverrideTypeSelected(input)) return true;
  return isPosManagerOverrideDiscountValueValid(input);
}

export function resolvePosManagerOverrideLabel(
  input: Pick<PosManagerOverrideChecklistInput, "discountMode" | "paymentMode">,
): string {
  if (input.paymentMode === "COMPED") return "Comp sale";
  if (input.discountMode === "fixed") return "Fixed discount";
  if (input.discountMode === "percent") return "Percent discount";
  return "Standard sale";
}

export function buildPosManagerOverrideChecklist(
  input: PosManagerOverrideChecklistInput,
): PosManagerOverrideChecklistStep[] {
  const overrideSelected = isPosManagerOverrideTypeSelected(input);
  const valueValid = isPosManagerOverrideDiscountValueValid(input);
  const readyToComplete = canCompletePosManagerOverrideSale(input);

  const chooseDetail = !input.canApplyPosDiscount
    ? "Requires pos.discount.apply — cashier must ask a manager."
    : overrideSelected
      ? resolvePosManagerOverrideLabel(input)
      : "Pick $ amount, percent, or comp sale — optional for standard checkout.";

  const setDiscountDetail = !input.canApplyPosDiscount
    ? "Blocked until a manager approves this register."
    : input.paymentMode === "COMPED"
      ? "Comp mode applies the full cart subtotal as manager-approved comp."
      : input.discountMode === "fixed"
        ? valueValid
          ? `Fixed discount ${formatPosManagerOverrideMoney(input.appliedDiscountAmount)} applied.`
          : input.fixedDiscountInvalid
            ? "Enter a valid dollar discount amount."
            : "Enter the fixed discount dollar amount."
        : input.discountMode === "percent"
          ? valueValid
            ? `Percent discount ${formatPosManagerOverrideMoney(input.appliedDiscountAmount)} applied.`
            : input.percentDiscountInvalid
              ? "Enter a percent between 0 and 100."
              : "Choose a preset or enter a custom percent."
          : "No discount value needed for a standard sale.";

  const reviewDetail = !input.canApplyPosDiscount
    ? "Cashiers complete standard sales — manager overrides stay disabled."
    : input.cartItemCount <= 0
      ? "Add cart items before completing the sale."
      : overrideSelected
        ? `Amount due ${formatPosManagerOverrideMoney(input.amountDue)} after manager override.`
        : `Amount due ${formatPosManagerOverrideMoney(input.amountDue)} — no override selected.`;

  return [
    {
      id: "manager_permission",
      label: "Manager permission",
      detail: input.canApplyPosDiscount
        ? "pos.discount.apply granted — discounts and comps allowed on this session."
        : "Discounts and comps require pos.discount.apply on this register session.",
      status: input.canApplyPosDiscount ? "complete" : "blocked",
    },
    {
      id: "choose_override",
      label: "Choose override type",
      detail: chooseDetail,
      status: !input.canApplyPosDiscount
        ? "blocked"
        : overrideSelected
          ? "complete"
          : "active",
    },
    {
      id: "set_discount",
      label: "Set discount value",
      detail: setDiscountDetail,
      status: !input.canApplyPosDiscount
        ? "blocked"
        : !overrideSelected
          ? "pending"
          : valueValid
            ? "complete"
            : "active",
    },
    {
      id: "review_complete",
      label: "Review & complete sale",
      detail: reviewDetail,
      status: !input.canApplyPosDiscount
        ? "blocked"
        : readyToComplete
          ? "active"
          : input.cartItemCount <= 0
            ? "pending"
            : "pending",
    },
  ];
}

export function summarizePosManagerOverrideChecklist(
  steps: readonly PosManagerOverrideChecklistStep[],
): {
  completedCount: number;
  activeStepId: PosManagerOverrideChecklistStepId | null;
  readyToComplete: boolean;
} {
  const completedCount = steps.filter((step) => step.status === "complete").length;
  const active = steps.find((step) => step.status === "active") ?? null;
  const readyToComplete = steps.find((step) => step.id === "review_complete")?.status === "active";

  return {
    completedCount,
    activeStepId: active?.id ?? null,
    readyToComplete,
  };
}

export function posManagerOverrideChecklistStepClassName(
  status: PosManagerOverrideChecklistStepStatus,
): string {
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

export function buildPosManagerOverrideSummary(input: PosManagerOverrideChecklistInput): {
  headline: string;
  detail: string;
  overrideLabel: string;
} {
  const overrideLabel = resolvePosManagerOverrideLabel(input);
  const headline =
    input.paymentMode === "COMPED"
      ? `Comp sale — ${formatPosManagerOverrideMoney(input.cartSubtotal)}`
      : input.appliedDiscountAmount > 0
        ? `${overrideLabel} — save ${formatPosManagerOverrideMoney(input.appliedDiscountAmount)}`
        : "Standard sale — no manager override";

  const detail =
    input.cartItemCount <= 0
      ? "Add items to the cart before applying a manager override."
      : `Subtotal ${formatPosManagerOverrideMoney(input.cartSubtotal)} · due ${formatPosManagerOverrideMoney(input.amountDue)}`;

  return { headline, detail, overrideLabel };
}

export function shouldShowPosManagerOverrideHero(
  input: PosManagerOverrideChecklistInput,
): boolean {
  return (
    input.canApplyPosDiscount &&
    isPosManagerOverrideTypeSelected(input) &&
    input.cartItemCount > 0
  );
}

export function posManagerOverrideClarityPolicySnapshot(): {
  policyId: typeof POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID;
  checklistSteps: number;
} {
  return {
    policyId: POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID,
    checklistSteps: 4,
  };
}
