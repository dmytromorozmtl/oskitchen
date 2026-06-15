/**
 * Pure helpers for AI confidence labels (Blueprint P2-107).
 */

export type AiConfidenceTier = "high" | "medium" | "low";

export type AiConfidenceBadgeVariant = "default" | "secondary" | "destructive" | "outline";

export type AiConfidenceLabelRow = {
  id: string;
  module: string;
  outputLabel: string;
  confidenceScore: number;
  tier: AiConfidenceTier;
  tierLabel: string;
  badgeVariant: AiConfidenceBadgeVariant;
  needsApproval: boolean;
  needsApprovalLabel: string | null;
  sourceReference: string;
  sourceDescription: string;
};

export type AiConfidenceLabelsReport = {
  labelCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  needsApprovalCount: number;
  labels: AiConfidenceLabelRow[];
};

const TIER_LABELS: Record<AiConfidenceTier, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function classifyConfidenceTier(score: number): AiConfidenceTier {
  if (score >= 0.9) return "high";
  if (score >= 0.7) return "medium";
  return "low";
}

export function confidenceTierToBadgeVariant(tier: AiConfidenceTier): AiConfidenceBadgeVariant {
  if (tier === "high") return "default";
  if (tier === "medium") return "secondary";
  return "destructive";
}

export function buildNeedsApprovalLabel(input: {
  tier: AiConfidenceTier;
  isActionDraft?: boolean;
}): { needsApproval: boolean; label: string | null } {
  if (input.isActionDraft || input.tier === "low") {
    return { needsApproval: true, label: "Needs approval" };
  }
  if (input.tier === "medium") {
    return { needsApproval: false, label: "Review recommended" };
  }
  return { needsApproval: false, label: null };
}

export function buildSourceReference(input: {
  sourceType: string;
  sourceId: string;
  sourceLabel?: string;
}): { reference: string; description: string } {
  const reference = `${input.sourceType}:${input.sourceId}`;
  const description =
    input.sourceLabel ??
    `Source: ${input.sourceType} record ${input.sourceId.slice(0, 8)}…`;
  return { reference, description };
}

export function buildAiConfidenceLabelRow(input: {
  id: string;
  module: string;
  outputLabel: string;
  confidenceScore: number;
  sourceType: string;
  sourceId: string;
  sourceLabel?: string;
  isActionDraft?: boolean;
}): AiConfidenceLabelRow {
  const tier = classifyConfidenceTier(input.confidenceScore);
  const approval = buildNeedsApprovalLabel({ tier, isActionDraft: input.isActionDraft });
  const source = buildSourceReference({
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    sourceLabel: input.sourceLabel,
  });

  return {
    id: input.id,
    module: input.module,
    outputLabel: input.outputLabel,
    confidenceScore: Math.round(input.confidenceScore * 1000) / 1000,
    tier,
    tierLabel: TIER_LABELS[tier],
    badgeVariant: confidenceTierToBadgeVariant(tier),
    needsApproval: approval.needsApproval,
    needsApprovalLabel: approval.label,
    sourceReference: source.reference,
    sourceDescription: source.description,
  };
}

export function buildAiConfidenceLabelsReport(
  rows: AiConfidenceLabelRow[],
): AiConfidenceLabelsReport {
  return {
    labelCount: rows.length,
    highCount: rows.filter((r) => r.tier === "high").length,
    mediumCount: rows.filter((r) => r.tier === "medium").length,
    lowCount: rows.filter((r) => r.tier === "low").length,
    needsApprovalCount: rows.filter((r) => r.needsApproval).length,
    labels: rows,
  };
}

/** Demo fixture — deterministic confidence labels without DB. */
export const AI_CONFIDENCE_LABELS_DEMO_INPUTS = [
  {
    id: "lbl-001",
    module: "Invoice scanner",
    outputLabel: "Sysco invoice #8842 — total $1,240.50",
    confidenceScore: 0.94,
    sourceType: "invoice",
    sourceId: "inv-sysco-8842",
    sourceLabel: "OCR scan — supplier invoice image",
  },
  {
    id: "lbl-002",
    module: "AI purchasing",
    outputLabel: "Reorder avocado — 12 cases suggested",
    confidenceScore: 0.78,
    sourceType: "ingredient",
    sourceId: "ing-avocado",
    sourceLabel: "Inventory par level + 7-day forecast",
  },
  {
    id: "lbl-003",
    module: "Co-Pilot draft",
    outputLabel: "Create PO — chicken restock",
    confidenceScore: 0.62,
    sourceType: "inventory",
    sourceId: "ing-chicken",
    sourceLabel: "Low stock signal — 12 lb on hand",
    isActionDraft: true,
  },
  {
    id: "lbl-004",
    module: "Food cost AI",
    outputLabel: "House fries margin alert — 58% food cost",
    confidenceScore: 0.55,
    sourceType: "product",
    sourceId: "prod-fries",
    sourceLabel: "Cost snapshot + 30-day order volume",
  },
  {
    id: "lbl-005",
    module: "Daily briefing",
    outputLabel: "Yesterday +12%. DoorDash orders up 18%.",
    confidenceScore: 0.88,
    sourceType: "orders",
    sourceId: "briefing-daily",
    sourceLabel: "Completed orders last 24h vs prior period",
  },
] as const;

export function buildAiConfidenceLabelsDemoReport(): AiConfidenceLabelsReport {
  const labels = AI_CONFIDENCE_LABELS_DEMO_INPUTS.map((input) => buildAiConfidenceLabelRow(input));
  return buildAiConfidenceLabelsReport(labels);
}
